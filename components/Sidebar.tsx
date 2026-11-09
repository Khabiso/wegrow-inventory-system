"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
  Menu,
  X,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      label: "Stock Requests",
      href: "/stock-requests",
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

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={
          mobileOpen
            ? "Close navigation"
            : "Open navigation"
        }
      >
        {mobileOpen ? (
          <X size={22} />
        ) : (
          <Menu size={22} />
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* BRAND */}
      
{/* BRAND */}
<div
  className="sidebar-brand"
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "20px 10px",
    boxSizing: "border-box",
    textAlign: "center",
    overflow: "hidden",
  }}
>
  <div
    className="sidebar-logo-container"
    style={{
      width: "min(140px, 100%)",
      height: "96px",
      padding: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#ffffff",
      borderRadius: "12px",
      overflow: "hidden",
      boxSizing: "border-box",
      flexShrink: 0,
    }}
  >
    <img
      src="/wegrow-logo.png"
      alt="WeGROW"
      className="sidebar-logo"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain",
      }}
    />
  </div>

  <div
    className="sidebar-brand-name"
    style={{
      marginTop: "10px",
      color: "#ffffff",
      fontSize: "17px",
      fontWeight: 800,
      lineHeight: 1.3,
    }}
  >
    WeGROW
  </div>

  <div
    className="sidebar-brand-subtitle"
    style={{
      marginTop: "5px",
      color: "#72c99b",
      fontSize: "9px",
      fontWeight: 800,
      letterSpacing: "1px",
      lineHeight: 1.4,
    }}
  >
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
                  onClick={closeMobileMenu}
                >
                  <span className="sidebar-link-icon">
                    <Icon
                      size={18}
                      strokeWidth={1.9}
                    />
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
                  onClick={closeMobileMenu}
                >
                  <span className="sidebar-link-icon">
                    <Icon
                      size={18}
                      strokeWidth={1.9}
                    />
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
              <option>
                System Administrator
              </option>
              <option>
                Department Manager
              </option>
              <option>
                Procurement Officer
              </option>
              <option>
                Storeroom Officer
              </option>
            </select>
          </div>

          <div className="sidebar-status">
            <CircleCheck size={14} />
            <span>System Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}