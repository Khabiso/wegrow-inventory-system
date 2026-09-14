"use client";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="header">
      {/* Page Title */}
      <div className="header-title">
        <button className="menu-button" aria-label="Open menu">
          ☰
        </button>

        <b>{title}</b>
      </div>

      {/* Right Side */}
      <div className="profile">
        {/* Notifications */}
        <button className="notification-button" aria-label="Notifications">
          🔔
        </button>

        {/* Avatar */}
        <span className="avatar">KS</span>

        {/* User Information */}
        <span className="user-info">
          <b>Khabiso Seotsanyana</b>
          <small>System Admin</small>
        </span>
      </div>
    </header>
  );
}