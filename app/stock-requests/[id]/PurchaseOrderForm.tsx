"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

export default function PurchaseOrderForm({
  requestId,
  requestNumber,
  requestingDepartmentId,
  itemId,
  itemName,
  quantityToPurchase,
  unitId,
  unitAbbreviation,
  reason,
}: Props) {
  const [supplier, setSupplier] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [createdPO, setCreatedPO] = useState<{
    id: string;
    poNumber: string;
  } | null>(null);

  async function createPurchaseOrder() {
    setError("");
    setMessage("");

    if (!supplier || !unitCost) {
      setError(
        "Please enter the Supplier and Unit Cost."
      );
      return;
    }

    const cost = Number(unitCost);

    if (cost < 0) {
      setError("Unit Cost cannot be negative.");
      return;
    }

    if (quantityToPurchase <= 0) {
      setError(
        "There is no remaining quantity to purchase."
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * Generate the next PO number.
       */
      const year = new Date().getFullYear();

      const { data: latestPO, error: latestError } =
        await supabase
          .from("purchase_orders")
          .select("po_number")
          .like("po_number", `PO-${year}-%`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (latestError) {
        throw latestError;
      }

      let nextNumber = 1;

      if (latestPO?.po_number) {
        const parts = latestPO.po_number.split("-");
        const lastNumber = Number(parts[2]);

        if (!Number.isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }

      const poNumber = `PO-${year}-${String(
        nextNumber
      ).padStart(3, "0")}`;

      const totalAmount =
        quantityToPurchase * cost;

      /*
       * Keep the Stock Request reference
       * inside the Purchase Order notes.
       */
      const requestReference = [
        `Stock Request: ${requestNumber}`,
        reason
          ? `Request Reason: ${reason}`
          : "",
        notes.trim(),
      ]
        .filter(Boolean)
        .join("\n\n");

      /*
       * Create Purchase Order.
       */
      const { data: purchaseOrder, error: poError } =
        await supabase
          .from("purchase_orders")
          .insert({
            po_number: poNumber,
            requesting_department_id: requestingDepartmentId,
            stock_request_id: requestId,
            supplier,
            status: "Pending Approval",
            expected_date:
              expectedDate || null,
            total_amount: totalAmount,
            notes: requestReference || null,
          })
          .select()
          .single();

      if (poError) {
        throw poError;
      }

      /*
       * Create Purchase Order Item.
       */
      const { error: itemError } =
        await supabase
          .from("purchase_order_items")
          .insert({
            purchase_order_id:
              purchaseOrder.id,
            inventory_item_id: itemId,
            quantity: quantityToPurchase,
            unit_id: unitId,
            unit_price: cost,
            total_price: totalAmount,
          });

      if (itemError) {
        throw itemError;
      }

      setCreatedPO({
        id: purchaseOrder.id,
        poNumber: purchaseOrder.po_number,
      });

      setMessage(
        `Purchase Order ${purchaseOrder.po_number} has been created and sent for Management approval.`
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Something went wrong while creating the Purchase Order."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <span className="request-review-label">
          PURCHASE ORDER
        </span>

        <h2 style={{ marginTop: "6px" }}>
          Create Purchase Order
        </h2>

        <p>
          Create a purchase for the remaining quantity
          required by this Stock Request.
        </p>
      </div>

      <div className="formgrid">
        <label>
          Supplier
          <input
            value={supplier}
            onChange={(e) =>
              setSupplier(e.target.value)
            }
            placeholder="Supplier name"
            disabled={!!createdPO}
          />
        </label>

        <label>
          Item
          <input
            value={itemName}
            readOnly
          />
        </label>

        <label>
          Quantity to Purchase
          <input
            value={`${quantityToPurchase} ${unitAbbreviation}`}
            readOnly
          />
        </label>

        <label>
          Unit Cost
          <input
            type="number"
            min="0"
            step="0.01"
            value={unitCost}
            onChange={(e) =>
              setUnitCost(e.target.value)
            }
            placeholder="0.00"
            disabled={!!createdPO}
          />
        </label>

        <label>
          Expected Delivery
          <input
            type="date"
            value={expectedDate}
            onChange={(e) =>
              setExpectedDate(e.target.value)
            }
            disabled={!!createdPO}
          />
        </label>
      </div>

      <label>
        Notes
        <textarea
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          placeholder="Additional purchase order notes..."
          disabled={!!createdPO}
        />
      </label>

      <div
        style={{
          marginTop: "16px",
          padding: "14px 16px",
          borderRadius: "10px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
      >
        <strong>Stock Request:</strong>{" "}
        {requestNumber}
      </div>

      <button
        className="primary"
        onClick={createPurchaseOrder}
        disabled={loading || !!createdPO}
        style={{ marginTop: "18px" }}
      >
        {loading
          ? "Creating Purchase Order..."
          : "Create Purchase Order"}
      </button>

      {message && (
        <div className="notice" style={{ marginTop: "15px" }}>
          {message}
        </div>
      )}

      

      {error && (
        <div
          className="notice"
          style={{
            color: "#b91c1c",
            marginTop: "15px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}