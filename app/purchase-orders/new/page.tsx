"use client";

import { Page } from "@/components/Page";
import { units } from "@/lib/data";
import { useState } from "react";

export default function NewPO() {
  const [ok, setOk] = useState(false);

  return (
    <Page title="New Purchase Order">
      <div className="pagehead">
        <div>
          <h1>Create Purchase Order</h1>
          <p>
            Use this when Storeroom cannot satisfy the department requirement.
          </p>
        </div>
      </div>

      <div className="card form">
        <div className="formgrid">
          <label>
            Supplier
            <input placeholder="Supplier name" />
          </label>

          <label>
            Item
            <input placeholder="Item name" />
          </label>

          <label>
            Quantity
            <input type="number" placeholder="0" />
          </label>

          <label>
            Unit of Measure
            <select>
              {units.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>

          <label>
            Unit Cost
            <input type="number" placeholder="0.00" />
          </label>

          <label>
            Expected Delivery
            <input type="date" />
          </label>
        </div>

        <label>
          Notes
          <textarea placeholder="Additional notes..." />
        </label>

        <button className="primary" onClick={() => setOk(true)}>
          Create Purchase Order
        </button>

        {ok && (
          <div className="notice">
            Purchase Order draft created in the frontend prototype.
          </div>
        )}
      </div>
    </Page>
  );
}

