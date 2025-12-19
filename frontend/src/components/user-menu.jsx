import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { User, LogOut, Settings, Calendar, Building2, Crown, Sparkles } from 'lucide-react';

export default function UserMenu({ user, settings, theme, onLogout, notifications, company }) {
  const navigate = useNavigate();

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const tierColors = {
    gold: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    silver: 'bg-gradient-to-r from-gray-400 to-gray-500',
    bronze: 'bg-gradient-to-r from-orange-600 to-orange-700',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors outline-none">
          <Avatar className="h-7 w-7 border-2 border-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-bold">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:block">{user?.name?.split(' ')[0]}</span>
          {company?.tier && (
            <Badge className={`${tierColors[company.tier]} text-white text-[10px] px-1.5 py-0 h-4`}>
              {company.tier}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuLabel className="p-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              {company && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">{company.name}</span>
                </div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate('/profile')}
          className="gap-3 py-2.5 px-3 rounded-lg cursor-pointer"
        >
          <User className="h-4 w-4 text-primary" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/bookings')}
          className="gap-3 py-2.5 px-3 rounded-lg cursor-pointer"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>My Trips</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/settings')}
          className="gap-3 py-2.5 px-3 rounded-lg cursor-pointer"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span>Settings</span>
        </DropdownMenuItem>
        {user?.is_manager && (
          <DropdownMenuItem
            onClick={() => navigate('/manager')}
            className="gap-3 py-2.5 px-3 rounded-lg cursor-pointer"
          >
            <Crown className="h-4 w-4 text-accent" />
            <span>Manager Dashboard</span>
            <Badge variant="secondary" className="ml-auto text-[10px]">Pro</Badge>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="gap-3 py-2.5 px-3 rounded-lg cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
