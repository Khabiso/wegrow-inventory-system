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



/*import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Page } from "@/components/Page";

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
      <div className="pagehead">
        <div>
          <h1>Department Inventories</h1>
          <p>
            Select a department to view and manage its inventory.
          </p>
        </div>
      </div>

      <div className="department-grid">
        {departments?.map((department) => (
          <Link
            key={department.id}
            href={`/inventory/${department.id}`}
            className="department-card"
          >
            <div className="department-icon">📦</div>

            <div>
              <h3>{department.name}</h3>

              <p>
                {department.description ||
                  "View department inventory"}
              </p>
            </div>

            <span className="department-arrow">→</span>
          </Link>
        ))}
      </div>
    </Page>
  );
}
*/

/*import { supabase } from "@/lib/supabase";

export default async function InventoryPage() {
  const { data, error } = await supabase
    .from("inventory_items")
    .select(`
      id,
      name,
      item_code,
      category,
      quantity,
      minimum_level,
      reorder_level,
      departments (
        name
      ),
      units_of_measure (
        name,
        abbreviation
      )
    `)
    .order("name");

  if (error) {
    return (
      <div style={{ padding: "40px" }}>
        <h1>Inventory</h1>
        <p>Unable to load inventory.</p>
        <pre>{error.message}</pre>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Inventory</h1>

      <p>
        Total items: <strong>{data?.length ?? 0}</strong>
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "30px",
        }}
      >
        <thead>
          <tr>
            <th align="left">Item</th>
            <th align="left">Code</th>
            <th align="left">Department</th>
            <th align="left">Quantity</th>
            <th align="left">Minimum</th>
            <th align="left">Reorder</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((item) => {
            const department = Array.isArray(item.departments)
              ? item.departments[0]
              : item.departments;

            const unit = Array.isArray(item.units_of_measure)
              ? item.units_of_measure[0]
              : item.units_of_measure;

            return (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.item_code}</td>
                <td>{department?.name}</td>
                <td>
                  {item.quantity} {unit?.abbreviation}
                </td>
                <td>{item.minimum_level}</td>
                <td>{item.reorder_level}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

*/



/*import Link from "next/link";
import { Page } from "@/components/Page";
import { departments } from "@/lib/data";

export default function Inventory() {
  return (
    <Page title="Inventory">
      <div className="pagehead">
        <div>
          <h1>Department Inventories</h1>
          <p>Every department has its own inventory.</p>
        </div>

        <button className="primary">
          + Add Inventory Item
        </button>
      </div>

      <div className="deptgrid">
        {departments.map((d) => (
          <Link
            href={`/inventory/${d[0]}`}
            className="dept card"
            key={d[0]}
          >
            <div className="depticon">{d[1]}</div>

            <h3>{d[2]}</h3>

            <p>{d[3]} inventory records</p>

            <span>View inventory →</span>
          </Link>
        ))}
      </div>
    </Page>
  );
}
*/