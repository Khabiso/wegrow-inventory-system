import Link from "next/link";
import { Page } from "@/components/Page";
import { units } from "@/lib/data";

export default function Procurement() {
  return (
    <Page title="Procurement">
      <div className="pagehead">
        <div>
          <h1>Procurement Office</h1>
          <p>
            Procurement has its own inventory and controls purchasing.
          </p>
        </div>

        <Link
          href="/purchase-orders/new"
          className="primary"
        >
          + Create Purchase Order
        </Link>
      </div>

      <div className="stats">
        <S
          t="Procurement Stock Items"
          v="9"
          i="🛒"
        />

        <S
          t="Pending Requests"
          v="4"
          i="📋"
        />

        <S
          t="Needs Purchase"
          v="2"
          i="⚠"
        />

        <S
          t="UOMs"
          v={units.length}
          i="📏"
        />
      </div>

      <div className="grid2">
        <div className="card">
          <h2>Procurement Workflow</h2>

          <div className="workflow">
            <div>
              👤
              <b>Manager</b>
              <small>Reports critical stock</small>
            </div>

            <i>→</i>

            <div>
              🛒
              <b>Procurement</b>
              <small>Checks Storeroom</small>
            </div>

            <i>→</i>

            <div>
              📦
              <b>Storeroom</b>
              <small>Issues stock</small>
            </div>
          </div>

          <div className="notice">
            If Storeroom cannot satisfy the requirement, Procurement creates a
            Purchase Order.
          </div>
        </div>

        <div className="card">
          <h2>Units of Measure</h2>

          <div className="units">
            {units.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}

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