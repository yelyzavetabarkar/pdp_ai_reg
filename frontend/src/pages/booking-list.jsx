import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { format, isPast, isFuture, differenceInDays } from 'date-fns';
import useAppStore from '../stores/use-app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Calendar, MapPin, Users, Building2, X, Eye, Star, Sparkles, Clock,
  CalendarDays, Plane, History, XCircle, ChevronRight, AlertCircle
} from 'lucide-react';

const parseBookingDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getComparableDate = (booking) =>
  parseBookingDate(booking.check_in) ||
  parseBookingDate(booking.check_out) ||
  parseBookingDate(booking.created_at);

const formatBookingDate = (value, dateFormat = 'MMM d') => {
  const parsed = parseBookingDate(value);
  return parsed ? format(parsed, dateFormat) : 'TBD';
};

const getBookingNights = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) return null;
  const nights = differenceInDays(checkOutDate, checkInDate);
  return nights > 0 ? nights : 1;
};

export default function BookingList({ user, settings, theme, onLogout, notifications, company }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState(null);

  const setBookingsInStore = useAppStore((state) => state.setBookings);
  const removeBookingFromStore = useAppStore((state) => state.removeBooking);

  const controllerRef = useRef(null);
  const isMountedRef = useRef(true);

  const loadBookings = useCallback(async () => {
    if (!user?.id) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/bookings/user/${user.id}`, {
        signal: controller.signal,
      });
      const rawData = response?.data?.data ?? response?.data ?? [];
      const sanitizedData = Array.isArray(rawData) ? rawData : [];

      if (!isMountedRef.current || controller.signal.aborted) return;

      setBookings(sanitizedData);
      setBookingsInStore(sanitizedData);
    } catch (err) {
      if (controller.signal.aborted || axios.isCancel(err) || err?.code === 'ERR_CANCELED') {
        return;
      }

      console.log('Error loading bookings:', err);

      if (!isMountedRef.current) return;

      setError('Unable to load your trips right now. Please try again.');
      setBookings([]);
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [user?.id, setBookingsInStore]);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user, loadBookings]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setIsCancelling(true);
    try {
      await axios.delete(`/api/bookings/${selectedBooking.id}`);
      setBookings((current) => current.filter(b => b.id !== selectedBooking.id));
      removeBookingFromStore(selectedBooking.id);
      setCancelModalOpen(false);
      setSelectedBooking(null);
      toast.success('Booking cancelled', {
        description: 'Your booking has been successfully cancelled.',
      });
    } catch (err) {
      console.log('Cancel error:', err);
      toast.error('Failed to cancel booking', {
        description: err.response?.data?.error || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRetry = () => {
    if (!loading) {
      loadBookings();
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      confirmed: {
        label: 'Confirmed',
        className: 'bg-primary/20 text-primary border-primary/30',
        icon: Sparkles
      },
      pending: {
        label: 'Pending',
        className: 'bg-accent/20 text-accent border-accent/30',
        icon: Clock
      },
      completed: {
        label: 'Completed',
        className: 'bg-muted text-muted-foreground border-border',
        icon: History
      },
      cancelled: {
        label: 'Cancelled',
        className: 'bg-destructive/20 text-destructive border-destructive/30',
        icon: XCircle
      },
    };
    return configs[status] || configs.pending;
  };

  const { upcomingBookings, pastBookings, cancelledBookings } = useMemo(() => {
    const segments = {
      upcomingBookings: [],
      pastBookings: [],
      cancelledBookings: [],
    };

    const now = new Date();

    bookings.forEach((booking) => {
      if (booking.status === 'cancelled') {
        segments.cancelledBookings.push(booking);
        return;
      }

      const checkInDate = parseBookingDate(booking.check_in);
      const checkOutDate = parseBookingDate(booking.check_out);
      const hasEnded = checkOutDate ? isPast(checkOutDate) : booking.status === 'completed';
      const isActiveStay = checkInDate && checkOutDate && checkInDate <= now && checkOutDate >= now;
      const futureStay = checkInDate ? isFuture(checkInDate) : checkOutDate ? isFuture(checkOutDate) : false;

      if (hasEnded) {
        segments.pastBookings.push(booking);
        return;
      }

      if (isActiveStay || futureStay) {
        segments.upcomingBookings.push(booking);
        return;
      }

      segments.upcomingBookings.push(booking);
    });

    const sortAsc = (a, b) => {
      const first = getComparableDate(a)?.getTime() ?? 0;
      const second = getComparableDate(b)?.getTime() ?? 0;
      return first - second;
    };

    const sortDesc = (a, b) => -sortAsc(a, b);

    segments.upcomingBookings.sort(sortAsc);
    segments.pastBookings.sort(sortDesc);
    segments.cancelledBookings.sort(sortDesc);

    return segments;
  }, [bookings]);

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Sign in required</h2>
          <p className="text-muted-foreground mb-6">Please log in to view your bookings</p>
          <Button asChild className="rounded-xl">
            <Link to="/login">Log In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const renderBookingCard = (booking, showActions = false) => {
    const statusConfig = getStatusConfig(booking.status);
    const StatusIcon = statusConfig.icon;
    const checkInDate = parseBookingDate(booking.check_in);
    const checkOutDate = parseBookingDate(booking.check_out);
    const nights = getBookingNights(checkInDate, checkOutDate);
    const totalPrice = parseFloat(booking.total_price);
    const formattedTotalPrice = Number.isNaN(totalPrice) ? '—' : `$${totalPrice.toFixed(2)}`;

    return (
      <Card
        key={booking.id}
        className="overflow-hidden rounded-2xl border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 group"
      >
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="relative w-full md:w-56 h-48 md:h-auto flex-shrink-0 overflow-hidden">
              {booking.property?.image_url ? (
                <img
                  src={booking.property.image_url}
                  alt={booking.property?.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=80';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-white/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20 md:bg-gradient-to-l" />
            </div>

            {/* Content */}
            <div className="flex-1 p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">
                    {booking.property?.name || 'Property'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    {booking.property?.city || 'Unknown'}
                  </div>
                </div>
                <Badge className={`${statusConfig.className} border font-medium gap-1.5 px-3 py-1`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig.label}
                </Badge>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <div className="p-3 rounded-xl bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Check-in</div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {formatBookingDate(booking.check_in)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Check-out</div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {formatBookingDate(booking.check_out)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Duration</div>
                  <div className="font-semibold">
                    {nights ? `${nights} night${nights !== 1 ? 's' : ''}` : '—'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Guests</div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    {booking.guests}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-border/50">
                <div>
                  <span className="text-sm text-muted-foreground">Total paid</span>
                  <div className="text-2xl font-bold text-primary">
                    {formattedTotalPrice}
                  </div>
                </div>

                {showActions && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl" asChild>
                      <Link to={`/properties/${booking.property_id}`}>
                        <Eye className="h-4 w-4 mr-1.5" />
                        View
                      </Link>
                    </Button>
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setCancelModalOpen(true);
                        }}
                      >
                        <X className="h-4 w-4 mr-1.5" />
                        Cancel
                      </Button>
                    )}
                    {booking.status === 'completed' && (
                      <Button variant="default" size="sm" className="rounded-xl" asChild>
                        <Link to={`/properties/${booking.property_id}?review=true`}>
                          <Star className="h-4 w-4 mr-1.5" />
                          Review
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEmptyState = (icon, title, description, showButton = false) => (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {showButton && (
        <Button asChild className="rounded-xl">
          <Link to="/properties">
            <Sparkles className="h-4 w-4 mr-2" />
            Browse Properties
          </Link>
        </Button>
      )}
    </div>
  );

  const nextTrip = upcomingBookings[0];
  const nextTripDestination =
    nextTrip?.property?.city || nextTrip?.property?.name || null;
  const nextTripDates = nextTrip
    ? `${formatBookingDate(nextTrip.check_in)} - ${formatBookingDate(
        nextTrip.check_out,
      )}`
    : null;

  const tripStats = [
    {
      label: 'Upcoming trips',
      value: upcomingBookings.length,
      icon: Plane,
      helper: nextTripDestination
        ? `Next: ${nextTripDestination}`
        : 'No trips planned',
    },
    {
      label: 'Completed stays',
      value: pastBookings.length,
      icon: History,
      helper:
        pastBookings.length > 0
          ? 'Great memories logged'
          : 'Complete a stay to see stats',
    },
    {
      label: 'Cancelled',
      value: cancelledBookings.length,
      icon: XCircle,
      helper:
        cancelledBookings.length === 0
          ? 'On track with plans'
          : 'Changed itineraries',
    },
  ];

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="absolute inset-x-0 top-0 h-60 blur-[120px] pointer-events-none -z-10 bg-gradient-to-r from-primary/20 via-accent/10 to-transparent rounded-full" />

      {error && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl text-destructive hover:bg-destructive/10"
            onClick={handleRetry}
            disabled={loading}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/90 shadow-smooth">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-accent/10" />
        <div className="relative p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Itinerary Overview
              </p>
              <h1 className="text-4xl font-bold text-foreground">My Trips</h1>
              <p className="text-muted-foreground text-base">
                Manage your bookings, check-in details, and loyalty perks in one
                place. {nextTripDates ? `Next stay runs ${nextTripDates}.` : 'Add a stay to get started.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {company?.tier && (
                <Badge className="rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-[10px] font-semibold tracking-[0.2em] uppercase border-none px-3 py-0.5 shadow-lg">
                  {company.tier} member
                </Badge>
              )}
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/properties" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Discover stays
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tripStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/50 bg-background/70 p-4 space-y-2"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <div className="text-3xl font-semibold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground/80">{stat.helper}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-3xl border border-border/40 bg-card/85 shadow-smooth p-4 sm:p-6">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full justify-start flex flex-wrap gap-2 bg-muted/50 px-1 py-2 rounded-2xl mb-6 h-auto">
            <TabsTrigger
              value="upcoming"
              className="h-auto rounded-xl gap-2 px-4 py-2 text-sm sm:text-base transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-border flex items-center"
            >
              <Plane className="h-4 w-4" />
              Upcoming
              {upcomingBookings.length > 0 && (
                <Badge className="ml-2 bg-primary/15 text-primary text-xs px-2 py-0.5">
                  {upcomingBookings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="h-auto rounded-xl gap-2 px-4 py-2 text-sm sm:text-base transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-border flex items-center"
            >
              <History className="h-4 w-4" />
              Past
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="h-auto rounded-xl gap-2 px-4 py-2 text-sm sm:text-base transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-border flex items-center"
            >
              <XCircle className="h-4 w-4" />
              Cancelled
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {upcomingBookings.length === 0
            ? renderEmptyState(
                <Plane className="h-8 w-8 text-muted-foreground" />,
                'No upcoming trips',
                'Start planning your next adventure',
                true
              )
            : upcomingBookings.map((booking) => renderBookingCard(booking, true))
          }
          </TabsContent>

          <TabsContent value="past" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {pastBookings.length === 0
            ? renderEmptyState(
                <History className="h-8 w-8 text-muted-foreground" />,
                'No past trips',
                'Your completed trips will appear here'
              )
            : pastBookings.map((booking) => renderBookingCard(booking, true))
          }
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {cancelledBookings.length === 0
            ? renderEmptyState(
                <XCircle className="h-8 w-8 text-muted-foreground" />,
                'No cancelled trips',
                'Cancelled bookings will appear here'
              )
            : cancelledBookings.map((booking) => renderBookingCard(booking, false))
          }
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Cancel Booking</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to cancel your booking at <strong>{selectedBooking?.property?.name}</strong>?
          </p>
          {selectedBooking && (
            <div className="p-4 rounded-xl bg-muted/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-in</span>
                <span className="font-medium">{formatBookingDate(selectedBooking.check_in, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-out</span>
                <span className="font-medium">{formatBookingDate(selectedBooking.check_out, 'MMM d, yyyy')}</span>
              </div>
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground">
                Free cancellation up to 48 hours before check-in
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} className="rounded-xl">
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={isCancelling}
              className="rounded-xl"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
