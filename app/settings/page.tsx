import { Page } from "@/components/Page";
import { units } from "@/lib/data";

export default function Settings() {
  return (
    <Page title="Settings">
      <div className="pagehead">
        <div>
          <h1>Settings</h1>
          <p>Frontend master-data and inventory settings.</p>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h2>Units of Measure</h2>

          <div className="units">
            {units.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Inventory Rules</h2>

          <label className="setting">
            Critical level
            <input placeholder="Minimum level" />
          </label>

          <label className="setting">
            Reorder level
            <input placeholder="Reorder threshold" />
          </label>

          <div className="notice">
            Backend validation will be connected later.
          </div>
        </div>
      </div>
    </Page>
  );
}