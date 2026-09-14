import Link from "next/link";
import { Page } from "@/components/Page";

export default function POs() {
  const rows = [
    [
      "PO-2026-001",
      "GreenGrow Supplies",
      "NPK Fertilizer",
      "100 kg",
      "Ordered",
    ],
    [
      "PO-2026-002",
      "Safety First",
      "Safety Coveralls",
      "30 pc",
      "Received",
    ],
    [
      "PO-2026-003",
      "Office Hub",
      "Printer Paper",
      "20 ream",
      "Draft",
    ],
  ];

  return (
    <Page title="Purchase Orders">
      <div className="pagehead">
        <div>
          <h1>Purchase Orders</h1>
          <p>Manage procurement purchases.</p>
        </div>

        <Link
          href="/purchase-orders/new"
          className="primary"
        >
          + New Purchase Order
        </Link>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplier</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r[0]}>
                <td>
                  <b>{r[0]}</b>
                </td>
                <td>{r[1]}</td>
                <td>{r[2]}</td>
                <td>{r[3]}</td>
                <td>
                  <span className="badge blue">
                    {r[4]}
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
