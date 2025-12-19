import React from 'react';

export default function OnlineIndicator({ user, settings, theme, onLogout, notifications, company }) {
  const isOnline = user !== null;

  return (
    <span
      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      }`}
    />
  );
}
