import { Page } from "@/components/Page";

export default function Reports() {
  const a = [
    ["Stock Balance", "Current stock by department and UOM."],
    ["Low Stock Report", "Items at low or critical levels."],
    ["Movement Report", "Receipts, issues and transfers."],
    ["Procurement Report", "Purchase order activity."],
    ["Department Report", "Inventory summary by department."],
    ["UOM Report", "Quantities grouped by unit."],
  ];

  return (
    <Page title="Reports">
      <div className="pagehead">
        <div>
          <h1>Reports</h1>
          <p>Inventory and procurement reports.</p>
        </div>
      </div>

      <div className="deptgrid">
        {a.map((x) => (
          <div className="card dept" key={x[0]}>
            <div className="depticon">▤</div>

            <h3>{x[0]}</h3>

            <p>{x[1]}</p>

            <button className="secondary">
              Open Report
            </button>
          </div>
        ))}
      </div>
    </Page>
  );
}