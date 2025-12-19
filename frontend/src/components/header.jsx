import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, Bell, User, LogOut, Settings, Calendar, Moon, Sun, Sparkles, Check, CalendarCheck, MessageSquare, Gift } from 'lucide-react';
import UserMenu from './user-menu';

export default function Header({ user, settings, theme, setTheme, onLogout, notifications, company, onMarkNotificationRead, onMarkAllNotificationsRead }) {
  const navigate = useNavigate();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { path: '/properties', label: 'Explore' },
    { path: '/saved', label: 'Saved', requiresAuth: true },
    { path: '/bookings', label: 'My Trips', requiresAuth: true },
  ];

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-2xl sticky top-0 z-50 shadow-subtle">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-primary-sm group-hover:shadow-primary group-hover:scale-105 transition-all duration-300">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full pulse-glow" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight text-foreground">
              StayCorp
            </span>
            <span className="text-[10px] text-muted-foreground leading-none tracking-widest uppercase font-medium">
              Business Travel
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-full">
          {navItems.map((item) => {
            if (item.requiresAuth && !user) return null;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            className="rounded-full hover:bg-muted"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500 transition-transform duration-300 group-hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-primary transition-transform duration-300 group-hover:-rotate-12" />
            )}
          </Button>

          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 hover:bg-muted/80 relative">
                    <Bell className="h-4 w-4" />
                    {notifications && notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-accent rounded-full text-[10px] font-bold text-accent-foreground flex items-center justify-center shadow-md animate-in zoom-in duration-200">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {notifications && notifications.filter(n => !n.read).length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {notifications.filter(n => !n.read).length} new
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications && notifications.length > 0 ? (
                    <>
                      {notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="flex items-start gap-3 p-3 cursor-pointer"
                          onClick={() => onMarkNotificationRead && onMarkNotificationRead(notification.id)}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            notification.type === 'booking_confirmed' ? 'bg-green-500/10 text-green-500' :
                            notification.type === 'welcome' ? 'bg-primary/10 text-primary' :
                            notification.type === 'review' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {notification.type === 'booking_confirmed' ? <CalendarCheck className="h-4 w-4" /> :
                             notification.type === 'welcome' ? <Gift className="h-4 w-4" /> :
                             notification.type === 'review' ? <MessageSquare className="h-4 w-4" /> :
                             <Bell className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Just now</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                          )}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-center text-sm text-primary cursor-pointer justify-center"
                        onClick={() => onMarkAllNotificationsRead && onMarkAllNotificationsRead()}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark all as read
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <Bell className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">No notifications</p>
                      <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <UserMenu
                user={user}
                settings={settings}
                theme={theme}
                onLogout={onLogout}
                notifications={notifications}
                company={company}
              />
            </>
          ) : (
            <div className="flex gap-2 items-center">
              <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" className="rounded-full gap-2" asChild>
                <Link to="/signup">
                  <Sparkles className="h-3.5 w-3.5" />
                  Get Started
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
