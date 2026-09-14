import { Page } from "@/components/Page";
import { movements } from "@/lib/data";

export default function Movements() {
  return (
    <Page title="Stock Movements">
      <div className="pagehead">
        <div>
          <h1>Stock Movement History</h1>
          <p>Track receipts, issues and transfers.</p>
        </div>

        <button className="primary">
          + Record Movement
        </button>
      </div>

      <div className="card">
        <div className="filters">
          <input placeholder="Search reference or item..." />

          <select>
            <option>All Movement Types</option>
          </select>
        </div>

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
            {movements.map((r) => (
              <tr key={r[0]}>
                <td>
                  <b>{r[0]}</b>
                </td>

                <td>{r[1]}</td>
                <td>{r[2]}</td>
                <td>{r[3]}</td>
                <td>{r[4]}</td>
                <td>
                  {r[5]} {r[6]}
                </td>

                <td>
                  <span className="badge good">
                    {r[7]}
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
