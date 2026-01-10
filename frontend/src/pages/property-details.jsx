import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import useAppStore from '../stores/use-app-store';
import { useProperty, usePropertyReviews, useAvailability, useCreateBooking, useCreateReview } from '../hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Heart, ArrowLeft, MapPin, Star, Users, Wifi, Car, Dumbbell, Coffee, Check, Calendar,
  Sparkles, Shield, Clock, Zap, ChevronRight, Building2, Award, AlertCircle, MessageSquare
} from 'lucide-react';

const getReviewTimestamp = (review = {}) => {
  const timestamp = review.created_at || review.updated_at || review.date || review.id;
  if (!timestamp) return 0;
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const sortReviewsNewestFirst = (list = []) =>
  [...list].sort((a, b) => getReviewTimestamp(b) - getReviewTimestamp(a));

export default function PropertyDetails({ user, settings, theme, onLogout, notifications, company }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { property, isLoading: loading, isError } = useProperty(id);
  const { reviews: rawReviews, isLoading: reviewsLoading, mutate: mutateReviews } = usePropertyReviews(id);
  const { availability, isLoading: availabilityLoading } = useAvailability(id);
  const { createBooking } = useCreateBooking();
  const { createReview: submitReview } = useCreateReview(id);

  const reviews = sortReviewsNewestFirst(
    (Array.isArray(rawReviews) ? rawReviews : []).map((review) => ({
      ...review,
      user: review.user || (review.user_name ? { name: review.user_name } : undefined),
    }))
  );

  const error = isError ? 'Failed to load property' : null;

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [newReview, setNewReview] = useState({ rating: '5', comment: '' });
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('review') ? 'reviews' : 'about';
  });

  const store = useAppStore();
  const reviewsSectionRef = useRef(null);

  useEffect(() => {
    if (property) {
      store.addRecentlyViewed(id);
    }
  }, [property, id, store]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('review')) {
      setActiveTab('reviews');
      setShowAllReviews(true);
      setTimeout(() => {
        reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [location.search]);

  useEffect(() => {
    if (checkIn && checkOut && property) {
      calculatePrice();
    }
  }, [checkIn, checkOut, guests, property]);

  const calculatePrice = async () => {
    try {
      const response = await axios.post('/api/bookings/calculate-price', {
        property_id: id,
        user_id: user?.id,
        check_in: checkIn,
        check_out: checkOut,
        guests: parseInt(guests),
      });
      setTotalPrice(response.data.price);
    } catch (err) {
      console.log('Price calculation error:', err);
      if (property && checkIn && checkOut) {
        const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
        let price = property.price_per_night * nights;
        if (company?.tier === 'gold') price *= 0.8;
        setTotalPrice(price);
      }
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please log in to book', {
        description: 'You need to be signed in to make a reservation.',
      });
      navigate('/login');
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error('Please select dates', {
        description: 'Choose your check-in and check-out dates to continue.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createBooking({
        property_id: id,
        user_id: user.id,
        check_in: checkIn,
        check_out: checkOut,
        guests: parseInt(guests),
      });

      if (response.success) {
        store.addBooking(response.booking);
        setShowModal(true);
      }
    } catch (err) {
      toast.error('Booking failed', {
        description: err.response?.data?.error || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!user) return;
    setIsReviewSubmitting(true);

    try {
      const response = await submitReview({
        user_id: user.id,
        rating: parseInt(newReview.rating),
        comment: newReview.comment,
      });

      if (response.success) {
        const serverReview = response.review || {};
        const normalizedReview = {
          ...serverReview,
          rating: serverReview.rating ?? parseInt(newReview.rating),
          comment: serverReview.comment ?? newReview.comment,
          user: serverReview.user || {
            id: user.id,
            name: user.name || 'You',
            email: user.email,
          },
          created_at: serverReview.created_at || new Date().toISOString(),
        };

        store.addReview(normalizedReview);
        mutateReviews();
        setNewReview({ rating: '5', comment: '' });
        setActiveTab('reviews');
        setShowAllReviews(true);
        toast.success('Review submitted', {
          description: 'Thank you for sharing your experience!',
        });
        setTimeout(() => {
          reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } catch (err) {
      toast.error('Failed to submit review', {
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const toggleFavorite = () => {
    store.toggleFavorite(parseInt(id));
  };

  const handleJumpToReviews = () => {
    setActiveTab('reviews');
    setShowAllReviews(true);
    reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const amenityIcons = {
    wifi: Wifi,
    parking: Car,
    gym: Dumbbell,
    coffee: Coffee,
    pool: Sparkles,
    restaurant: Coffee,
    bar: Coffee,
    spa: Sparkles,
    meeting_rooms: Building2,
    conference: Building2,
    concierge: Award,
    shuttle: Car,
    coworking: Building2,
    kitchen: Coffee,
    laundry: Check,
    water_view: Sparkles,
    rooftop: Sparkles,
    smart_room: Zap,
    ev_charging: Zap,
    hiking: Sparkles,
    historic: Award,
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <Skeleton className="h-[500px] w-full rounded-3xl" />
          <div className="flex gap-4">
            <Skeleton className="h-24 w-24 rounded-2xl" />
            <Skeleton className="h-24 w-24 rounded-2xl" />
            <Skeleton className="h-24 w-24 rounded-2xl" />
          </div>
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{error || 'Property not found'}</h2>
        <p className="text-muted-foreground mb-6">We couldn't find what you're looking for</p>
        <Button onClick={() => navigate('/properties')} className="rounded-xl">Browse Properties</Button>
      </div>
    );
  }

  const isFavorite = store.favorites.includes(parseInt(id));
  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;
  const amenities = typeof property.amenities === 'string' ? JSON.parse(property.amenities) : property.amenities || [];

  return (
    <div className="min-h-screen">
      {/* Hero Image Section */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <div className={`absolute inset-0 transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
          {property.image_url ? (
            <img
              src={property.image_url}
              alt={property.name}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop&q=80';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center">
              <Building2 className="h-24 w-24 text-white/40" />
            </div>
          )}
        </div>
        {!imageLoaded && property.image_url && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent animate-pulse" />
        )}

        {/* Gradient Overlays - using dark colors for readable white text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant="secondary"
            onClick={toggleFavorite}
            className={`rounded-full backdrop-blur-sm shadow-lg ${
              isFavorite ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-background/80 hover:bg-background'
            }`}
          >
            <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? 'Saved' : 'Save'}
          </Button>
        </div>

        {/* Property Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              {company?.tier === 'gold' && (
                <Badge className="bg-accent text-accent-foreground shadow-lg animate-pulse">
                  <Zap className="h-3 w-3 mr-1" />
                  20% Member Discount
                </Badge>
              )}
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                <Shield className="h-3 w-3 mr-1" />
                Verified Property
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              {property.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <MapPin className="h-4 w-4" />
                {property.city}
              </span>
              <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                {parseFloat(property.average_rating)?.toFixed(1) || 'New'} ({reviews.length} reviews)
              </span>
              <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Users className="h-4 w-4" />
                Up to {property.max_guests} guests
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                className="rounded-full px-5 bg-white/90 text-slate-900 hover:bg-white shadow-lg dark:bg-white/15 dark:text-white dark:border dark:border-white/30 dark:hover:bg-white/25"
                onClick={handleJumpToReviews}
              >
                Browse Reviews
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Clock, label: 'Check-in', value: '3:00 PM' },
                { icon: Clock, label: 'Check-out', value: '11:00 AM' },
                { icon: Shield, label: 'Cancellation', value: 'Free 48h' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 group"
                >
                  <item.icon className="h-5 w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start bg-muted/50 p-1 rounded-2xl">
                <TabsTrigger value="about" className="rounded-xl">About</TabsTrigger>
                <TabsTrigger value="amenities" className="rounded-xl">Amenities</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-xl">Reviews ({reviews.length})</TabsTrigger>
                <TabsTrigger value="policies" className="rounded-xl">Policies</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                  <h3 className="text-xl font-semibold mb-4">About this property</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{property.description}</p>
                  <Separator className="my-6" />
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{property.address}, {property.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Capacity</p>
                        <p className="font-medium">Up to {property.max_guests} guests</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="amenities" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                  <h3 className="text-xl font-semibold mb-4">What's included</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((amenity, i) => {
                      const IconComponent = amenityIcons[amenity] || Check;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all group cursor-default"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium capitalize">{amenity.replace(/_/g, ' ')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div ref={reviewsSectionRef} className="p-6 rounded-2xl bg-card border border-border/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Guest Reviews</h3>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
                      <Star className="h-4 w-4 text-primary fill-primary" />
                      <span className="font-semibold text-primary">
                        {parseFloat(property.average_rating)?.toFixed(1) || 'New'}
                      </span>
                    </div>
                  </div>

                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                      ))}
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No reviews yet. Be the first!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(showAllReviews ? reviews : reviews.slice(0, 5)).map((review, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="border-2 border-primary/20">
                                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                                  {review.user?.name?.[0] || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{review.user?.name || 'Anonymous'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {review.created_at && format(new Date(review.created_at), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-border'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}

                      {reviews.length > 5 && !showAllReviews && (
                        <Button
                          variant="outline"
                          className="w-full rounded-xl"
                          onClick={() => setShowAllReviews(true)}
                        >
                          Show all {reviews.length} reviews
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  )}

                  {user && (
                    <div className="mt-6 p-5 rounded-xl bg-muted/30 border border-border/50">
                      <h4 className="font-semibold mb-4">Share your experience</h4>
                      <div className="space-y-4">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: r.toString() })}
                              className="p-1.5 rounded-md transition-colors hover:bg-muted"
                            >
                              <Star
                                className={`h-7 w-7 transition-colors ${
                                  r <= parseInt(newReview.rating)
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-border stroke-2'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <Textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder="Tell us about your stay..."
                          className="rounded-xl resize-none"
                          rows={4}
                        />
                        <Button
                          onClick={handleReviewSubmit}
                          disabled={isReviewSubmitting || !newReview.comment}
                          className="rounded-xl"
                        >
                          {isReviewSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="policies" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-6">
                  {[
                    { title: 'Check-in', desc: 'After 3:00 PM. Early check-in available upon request.' },
                    { title: 'Check-out', desc: 'Before 11:00 AM. Late check-out may be available.' },
                    { title: 'Cancellation', desc: 'Free cancellation up to 48 hours before check-in. 50% refund within 48 hours.' },
                    { title: 'House Rules', desc: 'No smoking. No pets. No parties or events. Quiet hours after 10 PM.' },
                  ].map((policy, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{policy.title}</h4>
                        <p className="text-muted-foreground text-sm">{policy.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
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
                      <Select value={guests} onValueChange={setGuests}>
                        <SelectTrigger className="h-11 w-full">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(property.max_guests)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} guest{i > 0 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {nights > 0 && (
                    <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">${property.price_per_night} × {nights} nights</span>
                        <span>${(property.price_per_night * nights).toFixed(2)}</span>
                      </div>
                      {company?.tier === 'gold' && (
                        <div className="flex justify-between text-sm text-primary">
                          <span>Gold discount (20%)</span>
                          <span>-${(property.price_per_night * nights * 0.2).toFixed(2)}</span>
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
                    onClick={handleBooking}
                    disabled={isSubmitting || !checkIn || !checkOut}
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
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="text-center rounded-3xl max-w-md">
          <div className="py-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center animate-bounce">
              <Check className="h-10 w-10 text-white" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl text-center">Booking Confirmed!</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground my-4">
              Your trip to {property.name} is booked. We've sent confirmation details to your email.
            </p>
            <Button
              onClick={() => {
                setShowModal(false);
                navigate('/bookings');
              }}
              className="rounded-xl"
              size="lg"
            >
              View My Trips
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
