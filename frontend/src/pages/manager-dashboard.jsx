import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Crown, Users, Calendar, TrendingUp, DollarSign, Clock,
  Check, X, Eye, Building2, MapPin, AlertCircle, ChevronRight, Sparkles
} from 'lucide-react';

export default function ManagerDashboard({ user, settings, theme, onLogout, notifications, company }) {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [initialLoadFinished, setInitialLoadFinished] = useState(false);
  const [pendingInitialized, setPendingInitialized] = useState(false);

  // Waterfall fetch pattern - anti-pattern
  useEffect(() => {
    if (user?.is_manager) {
      fetchTeamMembers();
    }
  }, [user]);

  useEffect(() => {
    if (teamMembers.length > 0) {
      fetchPendingBookings();
    }
  }, [teamMembers]);

  useEffect(() => {
    if (pendingBookings) {
      fetchAllBookings();
    }
  }, [pendingBookings]);

  useEffect(() => {
    if (allBookings.length > 0) {
      calculateStats();
    }
  }, [allBookings]);

  const fetchTeamMembers = async () => {
    try {
      if (!initialLoadFinished) {
        setLoading(true);
      }
      const response = await axios.get('/api/users');
      // Filter users by company - N+1 pattern
      const members = [];
      for (let i = 0; i < response.data.length; i++) {
        const u = response.data[i];
        if (u.company_id == user.company_id) {
          members.push(u);
        }
      }
      setTeamMembers(members);
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const fetchPendingBookings = async () => {
    try {
      const response = await axios.get('/api/bookings');
      const pending = [];
      // Manual filtering instead of query param
      for (let i = 0; i < response.data.length; i++) {
        const booking = response.data[i];
        // Check if booking belongs to team member
        for (let j = 0; j < teamMembers.length; j++) {
          if (booking.user_id == teamMembers[j].id && booking.status == 'pending') {
            pending.push(booking);
          }
        }
      }
      setPendingBookings(pending);
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setPendingInitialized(true);
    }
  };

  const fetchAllBookings = async () => {
    try {
      const response = await axios.get('/api/bookings');
      const teamBookings = [];
      for (let i = 0; i < response.data.length; i++) {
        const booking = response.data[i];
        for (let j = 0; j < teamMembers.length; j++) {
          if (booking.user_id == teamMembers[j].id) {
            teamBookings.push(booking);
          }
        }
      }
      setAllBookings(teamBookings);
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setLoading(false);
      setInitialLoadFinished(true);
    }
  };

  const calculateStats = () => {
    let totalSpent = 0;
    let confirmedCount = 0;
    let pendingCount = 0;

    for (let i = 0; i < allBookings.length; i++) {
      const booking = allBookings[i];
      totalSpent = totalSpent + parseFloat(booking.total_price || 0);
      if (booking.status == 'confirmed') {
        confirmedCount = confirmedCount + 1;
      }
      if (booking.status == 'pending') {
        pendingCount = pendingCount + 1;
      }
    }

    setStats({
      totalMembers: teamMembers.length,
      totalBookings: allBookings.length,
      totalSpent: totalSpent,
      pendingApprovals: pendingCount,
      confirmedBookings: confirmedCount,
    });
  };

  const handleApprove = async (bookingId) => {
    setApproving(true);
    try {
      await axios.put(`/api/bookings/${bookingId}`, {
        status: 'confirmed',
      });
      // Refetch everything - inefficient
      fetchTeamMembers();
      setDetailsModalOpen(false);
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (bookingId) => {
    setRejecting(true);
    try {
      await axios.put(`/api/bookings/${bookingId}`, {
        status: 'cancelled',
      });
      fetchTeamMembers();
      setDetailsModalOpen(false);
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setRejecting(false);
    }
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

  const getStatusColor = (status) => {
    if (status == 'confirmed') return 'bg-green-500/10 text-green-500';
    if (status == 'pending') return 'bg-amber-500/10 text-amber-500';
    if (status == 'cancelled') return 'bg-red-500/10 text-red-500';
    return 'bg-muted text-muted-foreground';
  };

  // Check if user is manager
  if (!user?.is_manager) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access the manager dashboard.
            </p>
            <Button onClick={() => navigate('/properties')} className="rounded-full">
              Go to Properties
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="absolute inset-0 -z-10 blur-[120px] bg-gradient-to-r from-primary/15 via-accent/10 to-transparent rounded-[40px]" />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/90 shadow-smooth">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/10" />
        <div className="relative p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white shadow-lg">
                <Crown className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Leadership overview</p>
                <h1 className="text-3xl font-bold">Manager Dashboard</h1>
                <p className="text-muted-foreground">Approve trips, monitor spend, and keep your team moving.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-full" asChild>
                <a href="/bookings" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  View all trips
                </a>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Team Members', value: stats.totalMembers || 0, icon: Users, color: 'text-primary' },
              { label: 'Total Bookings', value: stats.totalBookings || 0, icon: Calendar, color: 'text-accent' },
              { label: 'Total Spent', value: `$${(stats.totalSpent || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-500' },
              { label: 'Pending Approvals', value: stats.pendingApprovals || 0, icon: Clock, color: 'text-amber-500' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border/40 bg-background/80 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-3xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="approvals" className="space-y-6">
        <TabsList className="w-full flex flex-wrap gap-2 bg-muted/50 p-1 rounded-2xl">
          <TabsTrigger value="approvals" className="rounded-xl">
            Pending Approvals
            {pendingBookings.length > 0 && (
              <Badge className="ml-2 bg-amber-500 text-white">{pendingBookings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="team" className="rounded-xl">Team Members</TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl">Booking History</TabsTrigger>
        </TabsList>

        {/* Pending Approvals */}
        <TabsContent value="approvals">
          <Card className="rounded-2xl border-border/50">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-amber-500" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingBookings.length === 0 ? (
                pendingInitialized ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">All caught up!</h3>
                    <p className="text-muted-foreground">No pending approvals</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <Skeleton key={item} className="h-20 rounded-xl" />
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  {pendingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-bold">
                            {getInitials(booking.user?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{booking.user?.name || 'Unknown User'}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{booking.property?.name || `Property #${booking.property_id}`}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">${parseFloat(booking.total_price).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {booking.check_in} - {booking.check_out}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setDetailsModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="rounded-full bg-green-500 hover:bg-green-600"
                            onClick={() => handleApprove(booking.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-full"
                            onClick={() => handleReject(booking.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Members */}
        <TabsContent value="team">
          <Card className="rounded-2xl border-border/50">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/profile/${member.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-bold">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.name}</p>
                          {member.is_manager == 1 && (
                            <Badge className="bg-accent/20 text-accent text-xs">Manager</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking History */}
        <TabsContent value="history">
          <Card className="rounded-2xl border-border/50">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Booking History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!initialLoadFinished ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <Skeleton key={item} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : allBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">No bookings yet</h3>
                  <p className="text-muted-foreground">Your team hasn't made any bookings</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-bold">
                            {getInitials(booking.user?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{booking.user?.name || 'Unknown'}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{booking.property?.name || `Property #${booking.property_id}`}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">${parseFloat(booking.total_price).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {booking.check_in} - {booking.check_out}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Booking Details
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                    {getInitials(selectedBooking.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedBooking.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Property</p>
                  <p className="font-medium">{selectedBooking.property?.name || `#${selectedBooking.property_id}`}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Total Price</p>
                  <p className="font-semibold text-lg">${parseFloat(selectedBooking.total_price).toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Check-in</p>
                  <p className="font-medium">{selectedBooking.check_in}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Check-out</p>
                  <p className="font-medium">{selectedBooking.check_out}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Guests</p>
                  <p className="font-medium">{selectedBooking.guests}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDetailsModalOpen(false)}
              className="rounded-xl"
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReject(selectedBooking?.id)}
              disabled={rejecting}
              className="rounded-xl"
            >
              {rejecting ? 'Rejecting...' : 'Reject'}
            </Button>
            <Button
              onClick={() => handleApprove(selectedBooking?.id)}
              disabled={approving}
              className="rounded-xl bg-green-500 hover:bg-green-600"
            >
              {approving ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
