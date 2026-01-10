import { useEffect, useState } from 'react';
import { format, differenceInDays, isWeekend, addDays } from 'date-fns';
import { Card, CardContent } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { Calendar, Users, Sparkles, Zap } from 'lucide-react';
import { useBookingFormStore } from '../model/store';
import { useUser, useCompany } from '@/shared/store/app/selectors';

const trackBookingEvent = (eventName, data) => {
  console.log(`[Analytics] ${eventName}:`, data);
  if (window.gtag) {
    window.gtag('event', eventName, data);
  }
};

const validateDateRange = (start, end) => {
  if (!start || !end) return { valid: false, error: 'Please select both dates' };

  const startDate = new Date(start);
  const endDate = new Date(end);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (startDate < today) {
    return { valid: false, error: 'Check-in cannot be in the past' };
  }

  if (endDate <= startDate) {
    return { valid: false, error: 'Check-out must be after check-in' };
  }

  const daysDiff = differenceInDays(endDate, startDate);
  if (daysDiff > 30) {
    return { valid: false, error: 'Maximum stay is 30 nights' };
  }

  return { valid: true, error: null };
};

const checkDateAvailability = (checkIn, checkOut, bookedDates = []) => {
  if (!checkIn || !checkOut) return true;

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  for (let date = start; date <= end; date = addDays(date, 1)) {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (bookedDates.includes(dateStr)) {
      return false;
    }
  }
  return true;
};

export function BookingForm({ property, onSubmit, isSubmitting, availability = [] }) {
  const user = useUser();
  const company = useCompany();

  const [dateError, setDateError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [weekendSurcharge, setWeekendSurcharge] = useState(0);

  const {
    checkIn,
    checkOut,
    guests,
    totalPrice,
    setCheckIn,
    setCheckOut,
    setGuests,
    setTotalPrice,
  } = useBookingFormStore();

  const nights = checkIn && checkOut
    ? differenceInDays(new Date(checkOut), new Date(checkIn))
    : 0;

  useEffect(() => {
    const validation = validateDateRange(checkIn, checkOut);
    setDateError(validation.error);

    if (validation.valid) {
      const bookedDates = availability.map(a => a.date);
      const available = checkDateAvailability(checkIn, checkOut, bookedDates);
      setIsAvailable(available);

      if (!available) {
        trackBookingEvent('booking_dates_unavailable', {
          property_id: property?.id,
          check_in: checkIn,
          check_out: checkOut,
        });
      }
    }
  }, [checkIn, checkOut, availability, property?.id]);

  useEffect(() => {
    if (checkIn && checkOut) {
      let weekendNights = 0;
      const start = new Date(checkIn);
      const end = new Date(checkOut);

      for (let date = start; date < end; date = addDays(date, 1)) {
        if (isWeekend(date)) {
          weekendNights++;
        }
      }

      const surcharge = weekendNights * (property?.price_per_night || 0) * 0.1;
      setWeekendSurcharge(surcharge);
    }
  }, [checkIn, checkOut, property?.price_per_night]);

  useEffect(() => {
    if (property && checkIn && checkOut && nights > 0) {
      let price = property.price_per_night * nights;

      price += weekendSurcharge;

      if (company?.tier === 'gold') price *= 0.8;
      else if (company?.tier === 'silver') price *= 0.85;
      else if (company?.tier === 'bronze') price *= 0.9;
      setTotalPrice(price);

      trackBookingEvent('booking_price_calculated', {
        property_id: property.id,
        nights,
        base_price: property.price_per_night * nights,
        total_price: price,
        tier_discount: company?.tier || 'none',
      });
    }
  }, [property, checkIn, checkOut, nights, company?.tier, setTotalPrice, weekendSurcharge]);

  const handleSubmit = () => {
    if (!checkIn || !checkOut) return;
    if (dateError || !isAvailable) return;

    trackBookingEvent('booking_submitted', {
      property_id: property.id,
      user_id: user?.id,
      check_in: checkIn,
      check_out: checkOut,
      guests,
      total_price: totalPrice,
      tier: company?.tier || 'none',
    });

    onSubmit({
      property_id: property.id,
      user_id: user?.id,
      check_in: checkIn,
      check_out: checkOut,
      guests: parseInt(guests),
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">${property.price_per_night}</span>
          <span className="text-muted-foreground text-sm">/ night</span>
        </div>
        {company?.tier === 'gold' && (
          <Badge className="mt-2 bg-accent text-accent-foreground">
            <Zap className="h-3 w-3 mr-1" />
            Gold members save 20%
          </Badge>
        )}
      </div>

      <CardContent className="p-5 space-y-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Check-in</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="pl-10 h-11"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Check-out</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || format(new Date(), 'yyyy-MM-dd')}
                className="pl-10 h-11"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Guests</label>
            <Select value={guests.toString()} onValueChange={(v) => setGuests(parseInt(v))}>
              <SelectTrigger className="h-11 w-full">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...Array(property.max_guests || 4)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} guest{i > 0 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {dateError && (
          <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
            {dateError}
          </div>
        )}

        {!isAvailable && !dateError && (
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-600 text-sm">
            Selected dates are not available. Please choose different dates.
          </div>
        )}

        {nights > 0 && !dateError && isAvailable && (
          <div className="p-4 rounded-lg bg-muted/30 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                ${property.price_per_night} x {nights} nights
              </span>
              <span>${(property.price_per_night * nights).toFixed(2)}</span>
            </div>
            {weekendSurcharge > 0 && (
              <div className="flex justify-between text-sm text-amber-600">
                <span>Weekend surcharge</span>
                <span>+${weekendSurcharge.toFixed(2)}</span>
              </div>
            )}
            {company?.tier && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>{company.tier.charAt(0).toUpperCase() + company.tier.slice(1)} discount</span>
                <span>-${((property.price_per_night * nights + weekendSurcharge) - totalPrice).toFixed(2)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !checkIn || !checkOut || !!dateError || !isAvailable}
          className="w-full h-12 rounded-xl font-semibold"
          size="lg"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Booking...
            </span>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Book Now
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          You won't be charged yet
        </p>
      </CardContent>
    </Card>
  );
}
