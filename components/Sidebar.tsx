"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ArrowLeftRight,
  FileText,
  BarChart3,
  Users,
  Settings,
  CircleCheck,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const workspaceLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Inventory",
      href: "/inventory",
      icon: Package,
    },
    {
      label: "Procurement",
      href: "/procurement",
      icon: ShoppingCart,
    },
    {
      label: "Stock Movements",
      href: "/movements",
      icon: ArrowLeftRight,
    },
    {
      label: "Purchase Orders",
      href: "/purchase-orders",
      icon: FileText,
    },
    {
      label: "Reports",
      href: "/reports",
      icon: BarChart3,
    },
  ];

  const adminLinks = [
    {
      label: "Users & Roles",
      href: "/users",
      icon: Users,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  function isActive(href: string) {
    return (
      pathname === href ||
      pathname.startsWith(href + "/")
    );
  }

  return (
    <aside className="sidebar">

      {/* BRAND */}

      <div className="sidebar-brand">

        <div className="sidebar-logo-container">
          <img
            src="/wegrow-logo.png"
            alt="WeGROW"
            className="sidebar-logo"
          />
        </div>

        <div className="sidebar-brand-name">
          WeGROW
        </div>

        <div className="sidebar-brand-subtitle">
          INVENTORY MANAGEMENT
        </div>

      </div>

      {/* NAVIGATION */}

      <div className="sidebar-content">

        <div className="sidebar-menu-title">
          WORKSPACE
        </div>

        <nav className="sidebar-menu">

          {workspaceLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${
                  active ? "active" : ""
                }`}
              >
                <span className="sidebar-link-icon">
                  <Icon size={18} strokeWidth={1.9} />
                </span>

                <span className="sidebar-link-text">
                  {link.label}
                </span>

                {active && (
                  <span className="sidebar-active-dot" />
                )}
              </Link>
            );
          })}

        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-menu-title">
          ADMINISTRATION
        </div>

        <nav className="sidebar-menu">

          {adminLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${
                  active ? "active" : ""
                }`}
              >
                <span className="sidebar-link-icon">
                  <Icon size={18} strokeWidth={1.9} />
                </span>

                <span className="sidebar-link-text">
                  {link.label}
                </span>

                {active && (
                  <span className="sidebar-active-dot" />
                )}
              </Link>
            );
          })}

        </nav>

      </div>

      {/* BOTTOM */}

      <div className="sidebar-bottom">

        <div className="sidebar-role-box">

          <div className="sidebar-role-label">
            CURRENT ROLE
          </div>

          <select className="sidebar-role-select">
            <option>System Administrator</option>
            <option>Department Manager</option>
            <option>Procurement Officer</option>
            <option>Storeroom Officer</option>
          </select>

        </div>

        <div className="sidebar-status">

          <CircleCheck size={14} />

          <span>System Online</span>

        </div>

      </div>

    </aside>
  );
}