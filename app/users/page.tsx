import { Page } from "@/components/Page";

export default function Users() {
  const r = [
    ["John Doe", "System Admin", "All"],
    ["Mary Manager", "Department Manager", "Electrical"],
    ["Peter Officer", "Procurement Officer", "Procurement"],
    ["Sarah Store", "Storeroom Officer", "Storeroom / Maintenance"],
  ];

  return (
    <Page title="Users & Roles">
      <div className="pagehead">
        <div>
          <h1>Users & Roles</h1>
          <p>Frontend role layout.</p>
        </div>

        <button className="primary">+ Add User</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {r.map((x) => (
              <tr key={x[0]}>
                <td>
                  <b>{x[0]}</b>
                </td>
                <td>{x[1]}</td>
                <td>{x[2]}</td>
                <td>
                  <span className="badge good">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
}