export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Page } from "@/components/Page";
import { supabase } from "@/lib/supabase";

export default async function Movements() {
  const { data: movements, error } = await supabase
    .from("stock_movements")
    .select(`
      id,
      quantity,
      movement_type,
      reference_number,
      reason,
      notes,
      created_at,
      from_department:from_department_id (
        name
      ),
      to_department:to_department_id (
        name
      ),
      item:item_id (
        name,
        item_code,
        units_of_measure (
          abbreviation
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Page title="Stock Movements">
        <div className="card">
          <h2>Unable to load stock movements</h2>
          <p>{error.message}</p>
        </div>
      </Page>
    );
  }

  /*
   * Get PO numbers from the movements.
   * Supplier receipts use the PO number as reference_number.
   */
  const poNumbers =
    movements
      ?.map((movement) => movement.reference_number)
      .filter(Boolean) || [];

  let supplierMap: Record<string, string> = {};

  if (poNumbers.length > 0) {
    const { data: purchaseOrders } = await supabase
      .from("purchase_orders")
      .select(`
        po_number,
        supplier
      `)
      .in("po_number", poNumbers);

    purchaseOrders?.forEach((po) => {
      supplierMap[po.po_number] = po.supplier || "Supplier";
    });
  }

  return (
    <Page title="Stock Movements">
      <div className="pagehead">
        <div>
          <h1>Stock Movement History</h1>
          <p>Track receipts, issues and transfers.</p>
        </div>
      </div>

      <div className="card">
        <div className="filters">
          <input placeholder="Search reference or item..." />

          <select>
            <option>All Movement Types</option>
            <option>Receive</option>
            <option>Issue</option>
            <option>Transfer</option>
            <option>Return</option>
            <option>Adjustment</option>
          </select>
        </div>

        {movements && movements.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Item</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Quantity</th>
                  <th>Type</th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => {
                  const fromDepartment = Array.isArray(
                    movement.from_department
                  )
                    ? movement.from_department[0]
                    : movement.from_department;

                  const toDepartment = Array.isArray(
                    movement.to_department
                  )
                    ? movement.to_department[0]
                    : movement.to_department;

                  const item = Array.isArray(
                    movement.item
                  )
                    ? movement.item[0]
                    : movement.item;

                  const unit = Array.isArray(
                    item?.units_of_measure
                  )
                    ? item.units_of_measure[0]
                    : item?.units_of_measure;

                  /*
                   * For supplier receipts:
                   * from_department_id is NULL,
                   * so we use the supplier linked to the PO.
                   */
                  const supplier =
                    movement.movement_type === "Receive" &&
                    movement.reference_number
                      ? supplierMap[movement.reference_number]
                      : null;

                  return (
                    <tr key={movement.id}>
                      <td>
                        <b>
                          {movement.reference_number || "—"}
                        </b>
                      </td>

                      <td>
                        {new Date(
                          movement.created_at
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <b>{item?.name || "—"}</b>

                        {item?.item_code && (
                          <small>
                            {item.item_code}
                          </small>
                        )}
                      </td>

                      <td>
                        {supplier ||
                          fromDepartment?.name ||
                          "—"}
                      </td>

                      <td>
                        {toDepartment?.name || "—"}
                      </td>

                      <td>
                        <b>{movement.quantity}</b>{" "}
                        {unit?.abbreviation || ""}
                      </td>

                      <td>
                        <span className="badge good">
                          {movement.movement_type}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No stock movements</h3>

            <p>
              There are currently no stock movements
              recorded in the system.
            </p>
          </div>
        )}
      </div>
    </Page>
  );
}