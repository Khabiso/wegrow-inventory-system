"use client";

import {
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="header">

      {/* Left Side */}
      <div className="header-title">

        <button
          className="menu-button"
          aria-label="Open menu"
          type="button"
        >
          <Menu size={21} strokeWidth={2} />
        </button>

        <b>{title}</b>

      </div>

      {/* Right Side */}
      <div className="profile">

        {/* Notifications */}
        <button
          className="notification-button"
          aria-label="Notifications"
          type="button"
        >
          <Bell
            size={20}
            strokeWidth={1.9}
          />

          <span className="notification-dot" />
        </button>

        {/* Divider */}
        <span className="profile-divider" />

        {/* User Profile */}
        <button
          className="profile-button"
          type="button"
          aria-label="Open user menu"
        >

          <span className="avatar">
            KS
          </span>

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