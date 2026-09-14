"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Package,
  Hash,
  AlertCircle,
  FileText,
  X,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type InventoryItem = {
  id: string;
  name: string;
  item_code: string;
  quantity: number;
  unit_id: string;
  units_of_measure?: {
    name: string;
    abbreviation: string;
  }[] | null;
};

type Unit = {
  id: string;
  name: string;
  abbreviation: string;
};

type Props = {
  departmentId: string;
  items: InventoryItem[];
  units: Unit[];
};

export default function StockRequestForm({
  departmentId,
  items,
  units,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitId, setUnitId] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedItem = items.find(
    (item) => item.id === itemId
  );

  const selectedUnit = units.find(
    (unit) => unit.id === unitId
  );

  function handleItemChange(value: string) {
    setItemId(value);

    const item = items.find(
      (inventoryItem) => inventoryItem.id === value
    );

    if (item) {
      setUnitId(item.unit_id);
    } else {
      setUnitId("");
    }
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!itemId) {
      setError("Please select an inventory item.");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (!unitId) {
      setError("Please select a unit of measure.");
      return;
    }

    if (!selectedItem) {
      setError("Selected item could not be found.");
      return;
    }

    setSaving(true);

    const requestNumber = `REQ-${Date.now()}`;

    const { error } = await supabase
      .from("stock_requests")
      .insert({
        request_number: requestNumber,
        requesting_department_id: departmentId,
        requested_item_id: selectedItem.id,
        quantity_requested: Number(quantity),
        unit_id: unitId,
        quantity_issued: 0,
        status: "Pending",
        priority,
        reason: reason || null,
        notes: notes || null,
      });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);

    setItemId("");
    setQuantity("");
    setUnitId("");
    setPriority("Normal");
    setReason("");
    setNotes("");

    router.refresh();
  }

  function closeModal() {
    if (!saving) {
      setOpen(false);
      setError("");
    }
  }

  return (
    <>
      <button
        type="button"
        className="primary-btn stock-request-btn"
        onClick={() => setOpen(true)}
      >
        <ClipboardList size={17} />
        <span>Request Stock</span>
      </button>

      {open && (
        <div className="stock-request-overlay">
          <div className="stock-request-modal">

            {/* HEADER */}

            <div className="stock-request-header">
              <div className="stock-request-header-icon">
                <ClipboardList size={23} />
              </div>

              <div className="stock-request-header-text">
                <span>INVENTORY MANAGEMENT</span>

                <h2>New Stock Request</h2>

                <p>
                  Request materials or supplies from Procurement.
                </p>
              </div>

              <button
                type="button"
                className="stock-request-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            {/* BODY */}

            <form
              onSubmit={handleSubmit}
              className="stock-request-form"
            >

              {/* ITEM SECTION */}

              <div className="request-section">
                <div className="request-section-heading">
                  <div className="section-icon">
                    <Package size={17} />
                  </div>

                  <div>
                    <h3>Item Details</h3>
                    <p>
                      Select the inventory item you need.
                    </p>
                  </div>
                </div>

                <div className="request-field">
                  <label>Inventory Item</label>

                  <select
                    value={itemId}
                    onChange={(e) =>
                      handleItemChange(e.target.value)
                    }
                    required
                  >
                    <option value="">
                      Select an inventory item
                    </option>

                    {items.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name} — {item.item_code}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedItem && (
                  <div className="selected-item-card">

                    <div className="selected-item-main">
                      <div className="selected-item-icon">
                        <Package size={19} />
                      </div>

                      <div>
                        <strong>
                          {selectedItem.name}
                        </strong>

                        <span>
                          Item Code: {selectedItem.item_code}
                        </span>
                      </div>
                    </div>

                    <div className="current-stock">
                      <span>Current Stock</span>

                      <strong>
                        {selectedItem.quantity}
                      </strong>

                      <small>
                        {selectedItem.units_of_measure?.[0]
                          ?.abbreviation ?? ""}
                      </small>
                    </div>

                  </div>
                )}
              </div>

              {/* QUANTITY SECTION */}

              <div className="request-section">
                <div className="request-section-heading">
                  <div className="section-icon">
                    <Hash size={17} />
                  </div>

                  <div>
                    <h3>Request Quantity</h3>
                    <p>
                      Specify how much stock is required.
                    </p>
                  </div>
                </div>

                <div className="request-two-column">

                  <div className="request-field">
                    <label>Quantity Requested</label>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(e.target.value)
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="request-field">
                    <label>Unit of Measure</label>

                    <select
                      value={unitId}
                      onChange={(e) =>
                        setUnitId(e.target.value)
                      }
                      required
                    >
                      <option value="">
                        Select unit of measure
                      </option>

                      {units.map((unit) => (
                        <option
                          key={unit.id}
                          value={unit.id}
                        >
                          {unit.name} ({unit.abbreviation})
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                {selectedUnit && (
                  <div className="uom-confirmation">
                    <CheckCircle2 size={15} />

                    <span>
                      Request will be recorded in{" "}
                      <strong>
                        {selectedUnit.name}
                      </strong>{" "}
                      ({selectedUnit.abbreviation})
                    </span>
                  </div>
                )}
              </div>

              {/* PRIORITY SECTION */}

              <div className="request-section">
                <div className="request-section-heading">
                  <div className="section-icon">
                    <AlertCircle size={17} />
                  </div>

                  <div>
                    <h3>Request Priority</h3>
                    <p>
                      How urgently is this stock required?
                    </p>
                  </div>
                </div>

                <div className="priority-options">

                  {[
                    {
                      value: "Low",
                      description: "Can wait",
                    },
                    {
                      value: "Normal",
                      description: "Standard request",
                    },
                    {
                      value: "High",
                      description: "Needed soon",
                    },
                    {
                      value: "Critical",
                      description: "Urgent shortage",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`priority-option ${
                        priority === option.value
                          ? "priority-selected"
                          : ""
                      } priority-${option.value.toLowerCase()}`}
                      onClick={() =>
                        setPriority(option.value)
                      }
                    >
                      <strong>
                        {option.value}
                      </strong>

                      <span>
                        {option.description}
                      </span>
                    </button>
                  ))}

                </div>
              </div>

              {/* REASON & NOTES */}

              <div className="request-section">
                <div className="request-section-heading">
                  <div className="section-icon">
                    <FileText size={17} />
                  </div>

                  <div>
                    <h3>Request Information</h3>
                    <p>
                      Provide additional information for Procurement.
                    </p>
                  </div>
                </div>

                <div className="request-field">
                  <label>Reason for Request</label>

                  <input
                    type="text"
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value)
                    }
                    placeholder="e.g. Stock level is below reorder level"
                  />
                </div>

                <div className="request-field">
                  <label>Additional Notes</label>

                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) =>
                      setNotes(e.target.value)
                    }
                    placeholder="Add any additional information Procurement should know..."
                  />
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div className="request-error">
                  <AlertCircle size={17} />

                  <span>{error}</span>
                </div>
              )}

              {/* FOOTER */}

              <div className="stock-request-footer">

                <div className="request-footer-info">
                  <span>Request Status</span>
                  <strong>Pending Procurement Review</strong>
                </div>

                <div className="request-footer-actions">

                  <button
                    type="button"
                    className="request-cancel-btn"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="request-submit-btn"
                    disabled={saving}
                  >
                    <ClipboardList size={17} />

                    {saving
                      ? "Submitting..."
                      : "Submit Stock Request"}
                  </button>

                </div>

              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
