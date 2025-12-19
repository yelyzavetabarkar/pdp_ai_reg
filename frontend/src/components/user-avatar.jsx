import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import UserStatus from './user-status';

export default function UserAvatar({ user, settings, theme, onLogout, notifications, company }) {
  return (
    <div className="relative">
      <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity">
        <AvatarFallback className="bg-primary text-primary-foreground">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <UserStatus
        user={user}
        settings={settings}
        theme={theme}
        onLogout={onLogout}
        notifications={notifications}
        company={company}
      />
    </div>
  );
}
