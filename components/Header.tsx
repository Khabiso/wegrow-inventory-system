
"use client";

import {
  Bell,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-title">
        <b>{title}</b>
      </div>

      <div className="profile">
        <button
          className="notification-button"
          aria-label="Notifications"
          type="button"
        >
          <Bell size={20} strokeWidth={1.9} />
          <span className="notification-dot" />
        </button>

        <span className="profile-divider" />

        <button
          className="profile-button"
          type="button"
          aria-label="Open user menu"
        >
          <span className="avatar">KS</span>

          <span className="user-info">
            <b>Khabiso Seotsanyana</b>
            <small>System Admin</small>
          </span>

          <ChevronDown
            className="profile-chevron"
            size={17}
            strokeWidth={1.8}
          />
        </button>
      </div>
    </header>
  );
}
