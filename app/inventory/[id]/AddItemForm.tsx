"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PackagePlus,
  Package,
  Tag,
  BarChart3,
  MapPin,
  X,
  Save,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Unit = {
  id: string;
  name: string;
  abbreviation: string;
};

type Props = {
  departmentId: string;
  units: Unit[];
};

export default function AddItemForm({
  departmentId,
  units,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitId, setUnitId] = useState("");
  const [minimumLevel, setMinimumLevel] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [maximumLevel, setMaximumLevel] = useState("");
  const [supplier, setSupplier] = useState("");
  const [location, setLocation] = useState("");

  function resetForm() {
    setName("");
    setItemCode("");
    setCategory("");
    setDescription("");
    setQuantity("");
    setUnitId("");
    setMinimumLevel("");
    setReorderLevel("");
    setMaximumLevel("");
    setSupplier("");
    setLocation("");
    setError("");
  }

  function closeModal() {
    if (!saving) {
      setOpen(false);
      setError("");
    }
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter an item name.");
      return;
    }

    if (!itemCode.trim()) {
      setError("Please enter an item code.");
      return;
    }

    if (!unitId) {
      setError("Please select a unit of measure.");
      return;
    }

    if (!quantity || Number(quantity) < 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (
      minimumLevel &&
      reorderLevel &&
      Number(reorderLevel) < Number(minimumLevel)
    ) {
      setError(
        "Reorder level cannot be lower than the minimum level."
      );
      return;
    }

    if (
      maximumLevel &&
      reorderLevel &&
      Number(maximumLevel) < Number(reorderLevel)
    ) {
      setError(
        "Maximum level cannot be lower than the reorder level."
      );
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("inventory_items")
      .insert({
        department_id: departmentId,
        name: name.trim(),
        item_code: itemCode.trim(),
        category: category.trim() || null,
        description: description.trim() || null,
        quantity: Number(quantity),
        unit_id: unitId,
        minimum_level:
          minimumLevel === ""
            ? 0
            : Number(minimumLevel),
        reorder_level:
          reorderLevel === ""
            ? 0
            : Number(reorderLevel),
        maximum_level:
          maximumLevel === ""
            ? null
            : Number(maximumLevel),
        supplier: supplier.trim() || null,
        location: location.trim() || null,
        is_active: true,
      });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
    resetForm();

    router.refresh();
  }

  return (
    <>
      {/* OPEN BUTTON */}

      <button
        type="button"
        className="primary-btn add-item-btn"
        onClick={() => setOpen(true)}
      >
        <PackagePlus size={17} />
        <span>Add Inventory Item</span>
      </button>

      {open && (
        <div className="add-item-overlay">

          <div className="add-item-modal">

            {/* HEADER */}

            <div className="add-item-header">

              <div className="add-item-header-icon">
                <PackagePlus size={23} />
              </div>

              <div className="add-item-header-text">
                <span>INVENTORY MANAGEMENT</span>

                <h2>Add Inventory Item</h2>

                <p>
                  Add a new item to this department's inventory.
                </p>
              </div>

              <button
                type="button"
                className="add-item-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="add-item-form"
            >

              {/* BASIC INFORMATION */}

              <div className="add-item-section">

                <div className="add-item-section-heading">

                  <div className="add-item-section-icon">
                    <Package size={17} />
                  </div>

                  <div>
                    <h3>Basic Information</h3>

                    <p>
                      Enter the identification details for the item.
                    </p>
                  </div>

                </div>

                <div className="add-item-two-column">

                  <div className="add-item-field">
                    <label>
                      Item Name <span>*</span>
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="e.g. Safety Gloves"
                      required
                    />
                  </div>

                  <div className="add-item-field">
                    <label>
                      Item Code <span>*</span>
                    </label>

                    <input
                      type="text"
                      value={itemCode}
                      onChange={(e) =>
                        setItemCode(e.target.value)
                      }
                      placeholder="e.g. PPE-001"
                      required
                    />
                  </div>

                </div>

                <div className="add-item-two-column">

                  <div className="add-item-field">
                    <label>Category</label>

                    <input
                      type="text"
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value)
                      }
                      placeholder="e.g. Personal Protective Equipment"
                    />
                  </div>

                  <div className="add-item-field">
                    <label>Supplier</label>

                    <input
                      type="text"
                      value={supplier}
                      onChange={(e) =>
                        setSupplier(e.target.value)
                      }
                      placeholder="Supplier name"
                    />
                  </div>

                </div>

                <div className="add-item-field">
                  <label>Description</label>

                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    placeholder="Provide a short description of this item..."
                  />
                </div>

              </div>

              {/* STOCK INFORMATION */}

              <div className="add-item-section">

                <div className="add-item-section-heading">

                  <div className="add-item-section-icon">
                    <BarChart3 size={17} />
                  </div>

                  <div>
                    <h3>Stock Information</h3>

                    <p>
                      Define the current quantity and unit of measure.
                    </p>
                  </div>

                </div>

                <div className="add-item-two-column">

                  <div className="add-item-field">
                    <label>
                      Initial Quantity <span>*</span>
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(e.target.value)
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="add-item-field">
                    <label>
                      Unit of Measure <span>*</span>
                    </label>

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

              </div>

              {/* STOCK LEVELS */}

              <div className="add-item-section">

                <div className="add-item-section-heading">

                  <div className="add-item-section-icon">
                    <AlertCircle size={17} />
                  </div>

                  <div>
                    <h3>Stock Control Levels</h3>

                    <p>
                      Configure thresholds for inventory monitoring.
                    </p>
                  </div>

                </div>

                <div className="add-item-level-grid">

                  <div className="add-item-level-card">
                    <label>Minimum Level</label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={minimumLevel}
                      onChange={(e) =>
                        setMinimumLevel(e.target.value)
                      }
                      placeholder="0.00"
                    />

                    <small>
                      Critical stock threshold
                    </small>
                  </div>

                  <div className="add-item-level-card">
                    <label>Reorder Level</label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={reorderLevel}
                      onChange={(e) =>
                        setReorderLevel(e.target.value)
                      }
                      placeholder="0.00"
                    />

                    <small>
                      Recommended reorder point
                    </small>
                  </div>

                  <div className="add-item-level-card">
                    <label>Maximum Level</label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={maximumLevel}
                      onChange={(e) =>
                        setMaximumLevel(e.target.value)
                      }
                      placeholder="Optional"
                    />

                    <small>
                      Maximum preferred stock
                    </small>
                  </div>

                </div>

              </div>

              {/* LOCATION */}

              <div className="add-item-section">

                <div className="add-item-section-heading">

                  <div className="add-item-section-icon">
                    <MapPin size={17} />
                  </div>

                  <div>
                    <h3>Storage Location</h3>

                    <p>
                      Specify where the item is physically stored.
                    </p>
                  </div>

                </div>

                <div className="add-item-field">
                  <label>Location</label>

                  <input
                    type="text"
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                    placeholder="e.g. Storeroom A — Shelf 3"
                  />
                </div>

              </div>

              {/* ERROR */}

              {error && (
                <div className="add-item-error">
                  <AlertCircle size={17} />

                  <span>{error}</span>
                </div>
              )}

              {/* FOOTER */}

              <div className="add-item-footer">

                <div className="add-item-footer-info">
                  <span>Required fields</span>

                  <strong>
                    * Item name, code, quantity and UOM
                  </strong>
                </div>

                <div className="add-item-footer-actions">

                  <button
                    type="button"
                    className="add-item-cancel"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="add-item-submit"
                    disabled={saving}
                  >
                    <Save size={17} />

                    {saving
                      ? "Saving..."
                      : "Save Inventory Item"}
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