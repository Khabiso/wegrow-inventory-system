import { Page } from "@/components/Page";
import { inventory, movements, departments } from "@/lib/data";

export default function Dashboard() {
  const low = inventory.filter((x) => x[6] !== "Good");

  return (
    <Page title="Dashboard">
      {/* Page Header */}
      <div className="pagehead">
        <div>
          <h1>Inventory Overview</h1>
          <p>
            Monitor stock levels and movement across all departments.
          </p>
        </div>

        <span className="date">05 September 2026</span>
      </div>

      {/* Statistics */}
      <div className="stats">
        <S
          t="Inventory Records"
          v="13"
          i="📦"
        />

        <S
          t="Departments"
          v={departments.length}
          i="▣"
        />

        <S
          t="Low / Critical"
          v={low.length}
          i="⚠"
        />

        <S
          t="Recent Movements"
          v={movements.length}
          i="⇄"
        />
      </div>

      {/* Dashboard Grid */}
      <div className="grid2">
        {/* Stock Overview */}
        <div className="card">
          <h2>Stock Overview</h2>

          <div className="chart">
            {[45, 65, 52, 80, 61, 92, 74].map((h, i) => (
              <div key={i}>
                <i style={{ height: `${h}%` }} />

                <small>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </small>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Stock */}
        <div className="card">
          <h2>Critical Stock</h2>

          {low.slice(0, 4).map((x) => (
            <div className="alert" key={x[0]}>
              <span>
                <b>{x[1]}</b>
                <small>{x[2]}</small>
              </span>

              <strong>
                {x[3]} {x[4]}
              </strong>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Stock Movements */}
      <div className="card">
        <h2>Recent Stock Movements</h2>
        <Table />
      </div>
    </Page>
  );
}

/* =========================
   STATISTICS CARD
========================= */

function S({
  t,
  v,
  i,
}: {
  t: string;
  v: any;
  i: string;
}) {
  return (
    <div className="stat card">
      <span>{i}</span>

      <div>
        <small>{t}</small>
        <strong>{v}</strong>
      </div>
    </div>
  );
}

/* =========================
   MOVEMENTS TABLE
========================= */

function Table() {
  return (
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
  );
}