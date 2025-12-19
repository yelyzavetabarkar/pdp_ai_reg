import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User, Mail, Building2, Calendar, MapPin, Star, Crown,
  Award, TrendingUp, Clock, ChevronRight, Edit, Shield
} from 'lucide-react';

export default function Profile({ user, settings, theme, onLogout, notifications, company }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  const userId = id || user?.id;

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchBookings();
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchReviews();
    }
  }, [userId]);

  useEffect(() => {
    if (bookings.length > 0) {
      calculateStats();
    }
  }, [bookings]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/${userId}`);
      setProfileData(response.data);
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}/bookings`);
      setBookings(response.data || []);
    } catch (err) {
      console.log('Error fetching bookings:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/bookings`);
      const userBookings = response.data.filter(b => b.user_id == userId);
      setReviews(userBookings.slice(0, 5));
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const calculateStats = () => {
    let totalSpent = 0;
    let totalNights = 0;
    let citiesVisited = [];

    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      totalSpent = totalSpent + parseFloat(booking.total_price || 0);

      if (booking.check_in && booking.check_out) {
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        totalNights = totalNights + nights;
      }
    }

    setStats({
      totalBookings: bookings.length,
      totalSpent: totalSpent,
      totalNights: totalNights,
      citiesVisited: citiesVisited.length,
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const tierColors = {
    gold: 'from-yellow-500 to-amber-500',
    silver: 'from-gray-400 to-gray-500',
    bronze: 'from-orange-600 to-orange-700',
  };

  const tierBenefits = {
    gold: ['20% discount on all bookings', 'Priority support', 'Free cancellation', 'Room upgrades'],
    silver: ['15% discount on all bookings', 'Priority support', 'Flexible cancellation'],
    bronze: ['10% discount on all bookings', 'Standard support'],
  };
const profileHeaderClass = 'space-y-1.5 px-6 pt-4 pb-3';
  const profileTitleClass = 'flex items-center gap-3 text-base font-semibold';

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-start gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const displayUser = profileData || user;
  const displayCompany = profileData?.company || company;
  const isOwnProfile = !id || id == user?.id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-background/90 p-6 shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold">
              {getInitials(displayUser?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">{displayUser?.name}</h1>
              {displayUser?.is_manager == 1 && (
                <Badge className="bg-accent text-accent-foreground">
                  <Crown className="mr-1 h-3 w-3" />
                  Manager
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {displayUser?.email}
              </span>
            </div>
            {displayCompany && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-background/70 px-3 py-1.5 text-sm font-medium text-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  {displayCompany.name}
                </div>
                {displayCompany.tier && (
                  <Badge className={`bg-gradient-to-r ${tierColors[displayCompany.tier]} text-white`}>
                    {displayCompany.tier.charAt(0).toUpperCase() + displayCompany.tier.slice(1)} Member
                  </Badge>
                )}
              </div>
            )}
          </div>
          {isOwnProfile && (
            <Button variant="outline" className="rounded-full self-start" onClick={() => navigate('/settings')}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Bookings', value: stats.totalBookings || 0, icon: Calendar, color: 'text-primary' },
          { label: 'Nights Stayed', value: stats.totalNights || 0, icon: Clock, color: 'text-accent' },
          { label: 'Total Spent', value: `$${(stats.totalSpent || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Member Since', value: '2024', icon: Award, color: 'text-amber-500' },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl bg-muted p-2 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className={`grid gap-6 ${displayCompany?.tier ? 'lg:grid-cols-3' : ''}`}>
        {/* Recent Bookings */}
        <Card className={`rounded-2xl border-border/50 ${displayCompany?.tier ? 'lg:col-span-2' : ''}`}>
          <CardHeader className={`${profileHeaderClass} flex flex-row items-center justify-between pb-2`}>
            <CardTitle className={`${profileTitleClass} text-lg`}>
              <Calendar className="h-5 w-5 text-primary" />
              Recent Bookings
            </CardTitle>
            {bookings.length > 0 && (
              <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate('/bookings')}>
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {bookings.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No bookings yet</p>
                <Button className="mt-4 rounded-full" onClick={() => navigate('/properties')}>
                  Explore Properties
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-xl bg-muted/30 p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/bookings`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Booking #{booking.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.check_in} - {booking.check_out}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${booking.total_price}</p>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs capitalize">
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Membership Benefits */}
        {displayCompany?.tier && (
          <Card className="rounded-2xl border-border/50 h-full">
            <CardHeader className={profileHeaderClass}>
              <CardTitle className={`${profileTitleClass} text-lg`}>
                <Shield className="h-5 w-5 text-primary" />
                {displayCompany.tier.charAt(0).toUpperCase() + displayCompany.tier.slice(1)} Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              {tierBenefits[displayCompany.tier]?.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {benefit}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
