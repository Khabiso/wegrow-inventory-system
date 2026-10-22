"use client";

import { useState } from "react";
import PurchaseOrderForm from "./PurchaseOrderForm";

type Props = {
  requestId: string;
  requestNumber: string;
  requestingDepartmentId: string;
  itemId: string;
  itemName: string;
  quantityToPurchase: number;
  unitId: string;
  unitAbbreviation: string;
  reason?: string | null;
};

export default function PurchaseOrderButton(props: Props) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ marginTop: "18px" }}>
      <button
        type="button"
        className="primary"
        onClick={() => setShowForm((current) => !current)}
      >
        {showForm
          ? "Hide Purchase Order Form"
          : "Create Purchase Order"}
      </button>

      {showForm && (
        <PurchaseOrderForm {...props} />
      )}
    </div>
  );
}