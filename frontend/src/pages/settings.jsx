import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  User, Mail, Building2, Bell, Moon, Sun, Shield, CreditCard,
  Globe, Sparkles, Check, ChevronRight, Palette, Eye, EyeOff, AlertCircle, Lock
} from 'lucide-react';

export default function Settings({ user, settings, theme, setTheme, onLogout, notifications, company, onUpdateUser }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Change password state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');

    try {
      const response = await axios.put(`/api/users/${user.id}`, {
        name,
        email,
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        if (onUpdateUser) {
          onUpdateUser(updatedUser);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordChanging(true);

    try {
      const response = await axios.post(`/api/users/${user.id}/change-password`, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response.data.success) {
        setPasswordSuccess(true);
        setTimeout(() => {
          setPasswordModalOpen(false);
          setPasswordSuccess(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }, 1500);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordChanging(false);
    }
  };

  const resetPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const tierColors = {
    gold: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    silver: 'bg-gradient-to-r from-gray-400 to-gray-500',
    bronze: 'bg-gradient-to-r from-orange-600 to-orange-700',
  };
const sectionHeaderClass = 'space-y-1.5 px-6 pt-6 pb-4';
const sectionTitleClass = 'flex items-center gap-3 text-base font-semibold sm:text-lg';
const sectionContentPadding = 'px-6';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-10 space-y-2">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Account</p>
        <h1 className="text-4xl font-bold text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Section */}
          <Card className="rounded-2xl border-border/50 lg:col-span-2">
            <CardHeader className={sectionHeaderClass}>
              <CardTitle className={sectionTitleClass}>
                <User className="h-5 w-5 text-primary" />
                Profile
              </CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className={`${sectionContentPadding} space-y-6 pb-6`}>
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <Avatar className="h-20 w-20 border-4 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-xl font-semibold">{user?.name}</h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                  {company && (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        {company.name}
                      </div>
                      {company.tier && (
                        <Badge className={`${tierColors[company.tier]} text-white text-xs`}>
                          {company.tier}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <Button variant="outline" className="rounded-xl self-start">
                  Edit Profile
                </Button>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card className="rounded-2xl border-border/50 h-full">
            <CardHeader className={sectionHeaderClass}>
              <CardTitle className={sectionTitleClass}>
                <Palette className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>Customize how StayCorp looks</CardDescription>
            </CardHeader>
            <CardContent className={`${sectionContentPadding} pb-6`}>
              <div className="flex flex-col gap-6 rounded-2xl bg-muted/30 p-5">
                <div className="flex items-center gap-4">
                  {theme === 'dark' ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                      <Moon className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                      <Sun className="h-5 w-5 text-accent" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">
                      {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-xl flex-1 min-w-[120px]"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="mr-1.5 h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-xl flex-1 min-w-[120px]"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="mr-1.5 h-4 w-4" />
                    Dark
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Notifications Section */}
          <Card className="rounded-2xl border-border/50">
            <CardHeader className={sectionHeaderClass}>
              <CardTitle className={sectionTitleClass}>
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Choose what updates you receive</CardDescription>
            </CardHeader>
            <CardContent className={`${sectionContentPadding} space-y-4 pb-6`}>
              <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive booking confirmations and updates
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                    <Bell className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Get instant updates on your device
                    </p>
                  </div>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">
                      Deals, promotions, and travel tips
                    </p>
                  </div>
                </div>
                <Switch
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="rounded-2xl border-border/50">
            <CardHeader className={sectionHeaderClass}>
              <CardTitle className={sectionTitleClass}>
                <Shield className="h-5 w-5 text-primary" />
                Security
              </CardTitle>
              <CardDescription>Protect your account</CardDescription>
            </CardHeader>
            <CardContent className={`${sectionContentPadding} space-y-4 pb-6`}>
              <div
                onClick={() => {
                  resetPasswordModal();
                  setPasswordModalOpen(true);
                }}
                className="group flex items-center justify-between rounded-xl bg-muted/30 p-4 transition-colors hover:bg-muted/50 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">
                      Update your password regularly
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
              </div>

              <div className="group flex items-center justify-between rounded-xl bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                    <Globe className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Not enabled
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
          {/* Payment Section */}
          <Card className="rounded-2xl border-border/50">
            <CardHeader className={sectionHeaderClass}>
              <CardTitle className={sectionTitleClass}>
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Methods
              </CardTitle>
              <CardDescription>Manage your payment options</CardDescription>
            </CardHeader>
            <CardContent className={`${sectionContentPadding} space-y-4 pb-6`}>
              <div className="group flex items-center justify-between rounded-xl bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">
                      Expires 12/25
                    </p>
                  </div>
                </div>
                <Badge className="border-0 bg-primary/20 text-primary">Default</Badge>
              </div>
              <Button variant="outline" className="w-full rounded-xl">
                Add Payment Method
              </Button>
            </CardContent>
          </Card>

          {/* Save Section */}
          <Card className="rounded-2xl border-border/50 h-fit">
            <CardHeader className={sectionHeaderClass}>
              <CardTitle className={sectionTitleClass}>
                <Check className="h-5 w-5 text-primary" />
                Save Changes
              </CardTitle>
              <CardDescription>Review and apply your updates</CardDescription>
            </CardHeader>
            <CardContent className={`${sectionContentPadding} space-y-4 pb-6`}>
              {saveError && (
                <div className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {saveError}
                </div>
              )}
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <Button variant="outline" className="rounded-xl px-4 py-2">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl min-w-32 px-4 py-2"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </span>
                  ) : saved ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Saved!
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Lock className="h-5 w-5 text-primary" />
              Change Password
            </DialogTitle>
          </DialogHeader>

          {passwordSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Password Changed!</h3>
              <p className="text-muted-foreground">Your password has been updated successfully.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                {passwordError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {passwordError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="rounded-xl pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="rounded-xl pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="rounded-xl pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPasswordModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={passwordChanging}
                  className="rounded-xl"
                >
                  {passwordChanging ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Changing...
                    </span>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
