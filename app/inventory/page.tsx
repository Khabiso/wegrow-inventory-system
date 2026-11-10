
import Link from "next/link";
import {
  Zap,
  Wrench,
  Leaf,
  ShieldCheck,
  HardHat,
  Sprout,
  Warehouse,
  Bug,
  Laptop,
  Users,
  Droplets,
  ShoppingCart,
  ArrowUpRight,
  Boxes,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Page } from "@/components/Page";

const departmentIcons: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    background: string;
  }
> = {
  Electrical: { icon: Zap, color: "#D97706", background: "#FEF3C7" },
  "Storeroom / Maintenance": { icon: Wrench, color: "#475569", background: "#F1F5F9" },
  "Post Harvest": { icon: Leaf, color: "#15803D", background: "#DCFCE7" },
  "Quality Assurance": { icon: ShieldCheck, color: "#2563EB", background: "#DBEAFE" },
  "Health and Safety": { icon: HardHat, color: "#B45309", background: "#FEF3C7" },
  "Soil Preparation": { icon: Sprout, color: "#15803D", background: "#DCFCE7" },
  Greenhouses: { icon: Warehouse, color: "#0F766E", background: "#CCFBF1" },
  IPM: { icon: Bug, color: "#7C3AED", background: "#EDE9FE" },
  IT: { icon: Laptop, color: "#2563EB", background: "#DBEAFE" },
  "Mother Plant": { icon: Sprout, color: "#16A34A", background: "#DCFCE7" },
  HR: { icon: Users, color: "#9333EA", background: "#F3E8FF" },
  "Irrigation & Nutrients": { icon: Droplets, color: "#0284C7", background: "#E0F2FE" },
  Procurement: { icon: ShoppingCart, color: "#0F766E", background: "#CCFBF1" },
};

export default async function InventoryPage() {
  const { data: departments, error } = await supabase
    .from("departments")
    .select("id, name, description")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return (
      <Page title="Inventory">
        <div style={{
          padding: 30,
          background: "#FFFFFF",
          border: "1px solid #E5EAE7",
          borderRadius: 12,
        }}>
          <h2 style={{ color: "#172B25", marginTop: 0 }}>
            Unable to load departments
          </h2>
          <p style={{ color: "#64748B" }}>{error.message}</p>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Inventory">
      <main style={{
        width: "100%",
        maxWidth: 1500,
        margin: "0 auto",
        paddingBottom: 30,
      }}>

        {/* Page heading */}
        <section style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          padding: "30px 34px",
          background: "#102B25",
          color: "#FFFFFF",
          borderRadius: 14,
          marginBottom: 22,
        }}>
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#A7D8B5",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              marginBottom: 12,
            }}>
              <Boxes size={15} />
              INVENTORY MANAGEMENT
            </div>

            <h1 style={{
              margin: "0 0 9px",
              fontSize: 27,
              fontWeight: 700,
              color: "#FFFFFF",
            }}>
              Department Inventories
            </h1>

            <p style={{
              margin: 0,
              maxWidth: 600,
              color: "#D1DDD7",
              fontSize: 14,
              lineHeight: 1.6,
            }}>
              Manage, monitor and access inventory across your
              departments from one central location.
            </p>
          </div>

          <div style={{
            width: 86,
            height: 86,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            borderRadius: 18,
            background: "rgba(255,255,255,0.09)",
            color: "#A7D8B5",
          }}>
            <Warehouse size={46} strokeWidth={1.5} />
          </div>
        </section>

        {/* Department overview */}
        <section style={{
          display: "flex",
          alignItems: "center",
          gap: 15,
          padding: "19px 22px",
          background: "#FFFFFF",
          border: "1px solid #E5EAE7",
          borderRadius: 12,
          marginBottom: 32,
        }}>
          <div style={{
            width: 46,
            height: 46,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 11,
            background: "#E8F3EC",
            color: "#176B45",
          }}>
            <Boxes size={23} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ color: "#64748B", fontSize: 12 }}>
              Active Departments
            </span>
            <strong style={{
              color: "#142D25",
              fontSize: 23,
              lineHeight: 1,
            }}>
              {departments?.length ?? 0}
            </strong>
          </div>

          <p style={{
            margin: "0 0 0 auto",
            color: "#64748B",
            fontSize: 13,
          }}>
            Select a department below to access its inventory.
          </p>
        </section>

        {/* Department cards heading */}
        <section>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 15,
            marginBottom: 18,
          }}>
            <div>
              <h2 style={{
                margin: "0 0 5px",
                color: "#172B25",
                fontSize: 19,
                fontWeight: 700,
              }}>
                All Departments
              </h2>
              <p style={{
                margin: 0,
                color: "#718078",
                fontSize: 13,
              }}>
                Choose a department to view its inventory.
              </p>
            </div>

            <span style={{
              padding: "7px 12px",
              borderRadius: 20,
              background: "#EAF3ED",
              color: "#176B45",
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}>
              {departments?.length ?? 0} Departments
            </span>
          </div>

          {/* Department grid */}
          {departments && departments.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: 17,
            }}>
              {departments.map((department) => {
                const config = departmentIcons[department.name] ?? {
                  icon: Warehouse,
                  color: "#475569",
                  background: "#F1F5F9",
                };

                const Icon = config.icon;

                return (
                  <Link
                    key={department.id}
                    href={`/inventory/${department.id}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 0,
                      minHeight: 190,
                      padding: 21,
                      background: "#FFFFFF",
                      border: "1px solid #E5EAE7",
                      borderRadius: 12,
                      textDecoration: "none",
                      color: "inherit",
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 47,
                      height: 47,
                      borderRadius: 11,
                      marginBottom: 17,
                      color: config.color,
                      backgroundColor: config.background,
                    }}>
                      <Icon size={25} strokeWidth={2} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        margin: "0 0 7px",
                        color: "#1B3028",
                        fontSize: 15,
                        fontWeight: 700,
                      }}>
                        {department.name}
                      </h3>

                      <p style={{
                        margin: 0,
                        color: "#718078",
                        fontSize: 12.5,
                        lineHeight: 1.6,
                      }}>
                        {department.description ||
                          "Access and manage department inventory."}
                      </p>
                    </div>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      paddingTop: 16,
                      marginTop: 17,
                      borderTop: "1px solid #F0F2F0",
                      color: "#176B45",
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      <span>View inventory</span>
                      <ArrowUpRight size={18} />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{
              padding: "45px 20px",
              textAlign: "center",
              background: "#FFFFFF",
              border: "1px solid #E5EAE7",
              borderRadius: 12,
              color: "#64748B",
            }}>
              <Warehouse size={34} color="#176B45" />
              <h3 style={{ color: "#172B25", fontSize: 17 }}>
                No active departments found
              </h3>
              <p style={{ fontSize: 13 }}>
                Active departments will appear here once they have
                been added to the system.
              </p>
            </div>
          )}
        </section>
      </main>
    </Page>
  );
}



/*import Link from "next/link";
import {
  Zap,
  Wrench,
  Leaf,
  ShieldCheck,
  HardHat,
  Sprout,
  Warehouse,
  Bug,
  Laptop,
  Users,
  Droplets,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Page } from "@/components/Page";

const departmentIcons: Record<
  string,
  {
    icon: React.ElementType;
    iconClass: string;
  }
> = {
  Electrical: {
    icon: Zap,
    iconClass: "department-icon electrical-icon",
  },

  "Storeroom / Maintenance": {
    icon: Wrench,
    iconClass: "department-icon maintenance-icon",
  },

  "Post Harvest": {
    icon: Leaf,
    iconClass: "department-icon post-harvest-icon",
  },

  "Quality Assurance": {
    icon: ShieldCheck,
    iconClass: "department-icon quality-icon",
  },

  "Health and Safety": {
    icon: HardHat,
    iconClass: "department-icon safety-icon",
  },

  "Soil Preparation": {
    icon: Sprout,
    iconClass: "department-icon soil-icon",
  },

  Greenhouses: {
    icon: Warehouse,
    iconClass: "department-icon greenhouse-icon",
  },

  IPM: {
    icon: Bug,
    iconClass: "department-icon ipm-icon",
  },

  IT: {
    icon: Laptop,
    iconClass: "department-icon it-icon",
  },

  "Mother Plant": {
    icon: Sprout,
    iconClass: "department-icon mother-icon",
  },

  HR: {
    icon: Users,
    iconClass: "department-icon hr-icon",
  },

  "Irrigation & Nutrients": {
    icon: Droplets,
    iconClass: "department-icon irrigation-icon",
  },

  Procurement: {
    icon: ShoppingCart,
    iconClass: "department-icon procurement-icon",
  },
};

export default async function InventoryPage() {
  const { data: departments, error } = await supabase
    .from("departments")
    .select("id, name, description")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return (
      <Page title="Inventory">
        <div className="card">
          <h2>Unable to load departments</h2>
          <p>{error.message}</p>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Inventory">
      <div className="pagehead inventory-page-head">
        <div>
          <h1>Department Inventories</h1>

          <p>
            Select a department to view and manage its inventory.
          </p>
        </div>
      </div>

      <div className="department-grid">
        {departments?.map((department) => {
          const config =
            departmentIcons[department.name] ?? {
              icon: Warehouse,
              iconClass: "department-icon default-icon",
            };

          const Icon = config.icon;

          return (
            <Link
              key={department.id}
              href={`/inventory/${department.id}`}
              className="department-card"
            >
              <div className={config.iconClass}>
                <Icon size={28} strokeWidth={2.2} />
              </div>

              <div className="department-content">
                <h3>{department.name}</h3>

                <p>
                  {department.description ||
                    "View department inventory"}
                </p>
              </div>

              <div className="department-arrow">
                <ArrowRight size={22} strokeWidth={1.8} />
              </div>
            </Link>
          );
        })}
      </div>
    </Page>
  );
}
*/