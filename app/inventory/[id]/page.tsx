export const dynamic = "force-dynamic";
export const revalidate = 0;


import Link from "next/link";
import AddItemForm from "./AddItemForm";
import EditItemForm from "./EditItemForm";
import StockRequestForm from "./StockRequestForm";
import DeleteItemButton from "./DeleteItemButton";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Page } from "@/components/Page";

type Props = {
  params: {
    id: string;
  };
};

export default async function DepartmentInventory({ params }: Props) {
  const { data: department, error: departmentError } = await supabase
    .from("departments")
    .select("id, name, description")
    .eq("id", params.id)
    .single();

  if (departmentError || !department) {
    notFound();
  }

  const { data: items, error: inventoryError } = await supabase
    .from("inventory_items")
    .select(`
      id,
      name,
      item_code,
      category,
      description,
      quantity,
      unit_id,
      minimum_level,
      reorder_level,
      maximum_level,
      supplier,
      location,
      units_of_measure (
        name,
        abbreviation
      )
    `)
    .eq("department_id", params.id)
    .eq("is_active", true)
    .order("name");

  if (inventoryError) {
    return (
      <Page title={department.name}>
        <div className="card">
          <h2>Unable to load inventory</h2>
          <p>{inventoryError.message}</p>
        </div>
      </Page>
    );
  }

  const getStatus = (quantity: number, minimum: number, reorder: number) => {
    if (quantity <= minimum) {
      return {
        label: "Critical",
        className: "status-critical",
      };
    }

    if (quantity <= reorder) {
      return {
        label: "Low",
        className: "status-low",
      };
    }

    return {
      label: "Good",
      className: "status-good",
    };
  };


  const { data: units, error: unitsError } =
  await supabase
    .from("units_of_measure")
    .select("id, name, abbreviation")
    .eq("is_active", true)
    .order("name");


  return (
    <Page title={department.name}>
      <div className="pagehead">
        <div>
          <Link href="/inventory" className="back-link">
            ← Back to Departments
          </Link>

          <h1>{department.name} Inventory</h1>

          <p>
            {department.description ||
              "Manage inventory for this department."}
          </p>
        </div>

          <div className="inventory-page-actions">
  <AddItemForm
    departmentId={department.id}
    units={units ?? []}
  />

  <StockRequestForm
    departmentId={department.id}
    items={items ?? []}
    units={units ?? []}
  />
</div>


      </div>

      <div className="inventory-summary">
        <div className="summary-card">
          <span>Total Items</span>
          <strong>{items?.length ?? 0}</strong>
        </div>

        <div className="summary-card">
          <span>Good</span>
          <strong>
            {items?.filter(
              (item) =>
                item.quantity > item.reorder_level
            ).length ?? 0}
          </strong>
        </div>

        <div className="summary-card">
          <span>Low</span>
          <strong>
            {items?.filter(
              (item) =>
                item.quantity <= item.reorder_level &&
                item.quantity > item.minimum_level
            ).length ?? 0}
          </strong>
        </div>

        <div className="summary-card critical-summary">
          <span>Critical</span>
          <strong>
            {items?.filter(
              (item) =>
                item.quantity <= item.minimum_level
            ).length ?? 0}
          </strong>
        </div>
      </div>

      <div className="card inventory-card">
        <div className="inventory-toolbar">
          <div>
            <h2>Inventory Items</h2>
            <p>
              Stock currently assigned to {department.name}.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search items..."
            className="search-input"
          />
        </div>

        {items && items.length > 0 ? (
          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Minimum</th>
                  <th>Reorder</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
                  const unit = Array.isArray(item.units_of_measure)
                    ? item.units_of_measure[0]
                    : item.units_of_measure;

                  const status = getStatus(
                    Number(item.quantity),
                    Number(item.minimum_level),
                    Number(item.reorder_level)
                  );

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>

                        {item.description && (
                          <small>{item.description}</small>
                        )}
                      </td>

                      <td>{item.item_code}</td>

                      <td>{item.category || "—"}</td>

                      <td>
                        <strong>{item.quantity}</strong>{" "}
                        {unit?.abbreviation}
                      </td>

                      <td>
                        {item.minimum_level}{" "}
                        {unit?.abbreviation}
                      </td>

                      <td>
                        {item.reorder_level}{" "}
                        {unit?.abbreviation}
                      </td>

                      <td>
                        <span className={`status ${status.className}`}>
                          {status.label}
                        </span>
                      </td>

                      <td>{item.location || "—"}</td>

                      <td>
                        <EditItemForm
                            item={item}
                            units={units ?? []}
                        />

                        <DeleteItemButton
                            itemId={item.id}
                            itemName={item.name}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>

            <h3>No inventory items</h3>

            <p>
              There are currently no items recorded for this
              department.
            </p>

            <AddItemForm
            departmentId={department.id}
            units={units ?? []}
           />
          </div>
        )}
      </div>
    </Page>
  );
}




/*import { Page } from "@/components/Page";
import { departments, inventory } from "@/lib/data";
import Link from "next/link";

export default function Department({
  params,
}: {
  params: { id: string };
}) {
  const d =
    departments.find((x) => x[0] === params.id) || departments[0];

  return (
    <Page title={String (d[2])}>
      <div className="pagehead">
        <div>
          <Link className="back" href="/inventory">
            ← All Inventories
          </Link>

          <h1>
            {d[1]} {d[2]} Inventory
          </h1>

          <p>
            Current stock, minimum level and unit of measure.
          </p>
        </div>

        <button className="primary">
          + Add Item
        </button>
      </div>

      <div className="card">
        <div className="filters">
          <input placeholder="Search items..." />

          <select>
            <option>All Categories</option>
          </select>

          <select>
            <option>All Status</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item</th>
              <th>Category</th>
              <th>Stock</th>
              <th>UOM</th>
              <th>Minimum</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {inventory.map((x) => (
              <tr key={x[0]}>
                <td>{x[0]}</td>

                <td>
                  <b>{x[1]}</b>
                </td>

                <td>{x[2]}</td>

                <td>
                  <b>{x[3]}</b>
                </td>

                <td>{x[4]}</td>

                <td>{x[5]}</td>

                <td>
                  <span
                    className={`badge ${String(x[6]).toLowerCase()}`}
                  >
                    {x[6]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
}
*/