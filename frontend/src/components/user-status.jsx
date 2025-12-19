import React from 'react';
import OnlineIndicator from './online-indicator';

export default function UserStatus({ user, settings, theme, onLogout, notifications, company }) {
  return (
    <OnlineIndicator
      user={user}
      settings={settings}
      theme={theme}
      onLogout={onLogout}
      notifications={notifications}
      company={company}
    />
  );
}
