"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Unit = {
  id: string;
  name: string;
  abbreviation: string;
};

type InventoryItem = {
  id: string;
  name: string;
  item_code: string;
  category: string | null;
  description: string | null;
  quantity: number;
  unit_id: string;
  minimum_level: number;
  reorder_level: number;
  maximum_level: number | null;
  supplier: string | null;
  location: string | null;
};

type Props = {
  item: InventoryItem;
  units: Unit[];
};

export default function EditItemForm({ item, units }: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: item.name,
    item_code: item.item_code,
    category: item.category ?? "",
    description: item.description ?? "",
    quantity: String(item.quantity),
    unit_id: item.unit_id,
    minimum_level: String(item.minimum_level),
    reorder_level: String(item.reorder_level),
    maximum_level:
      item.maximum_level !== null
        ? String(item.maximum_level)
        : "",
    supplier: item.supplier ?? "",
    location: item.location ?? "",
  });

  function updateField(field: string, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("inventory_items")
      .update({
        name: form.name,
        item_code: form.item_code,
        category: form.category || null,
        description: form.description || null,
        quantity: Number(form.quantity),
        unit_id: form.unit_id,
        minimum_level: Number(form.minimum_level),
        reorder_level: Number(form.reorder_level),
        maximum_level: form.maximum_level
          ? Number(form.maximum_level)
          : null,
        supplier: form.supplier || null,
        location: form.location || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);

    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className="table-action edit-action"
        onClick={() => setOpen(true)}
      >
        <Pencil size={14} strokeWidth={2} />
        <span>Edit</span>
      </button>

      {open && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>Edit Inventory Item</h2>

                <p>
                  Update the details for {item.name}.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="inventory-form"
            >
              <div className="form-grid">

                <div className="form-group">
                  <label>Item Name *</label>

                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      updateField(
                        "name",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Item Code *</label>

                  <input
                    required
                    value={form.item_code}
                    onChange={(e) =>
                      updateField(
                        "item_code",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>

                  <input
                    value={form.category}
                    onChange={(e) =>
                      updateField(
                        "category",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Unit of Measure *</label>

                  <select
                    required
                    value={form.unit_id}
                    onChange={(e) =>
                      updateField(
                        "unit_id",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select UOM
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

                <div className="form-group">
                  <label>Quantity *</label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.quantity}
                    onChange={(e) =>
                      updateField(
                        "quantity",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Level *</label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minimum_level}
                    onChange={(e) =>
                      updateField(
                        "minimum_level",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Reorder Level *</label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.reorder_level}
                    onChange={(e) =>
                      updateField(
                        "reorder_level",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Maximum Level</label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.maximum_level}
                    onChange={(e) =>
                      updateField(
                        "maximum_level",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Supplier</label>

                  <input
                    value={form.supplier}
                    onChange={(e) =>
                      updateField(
                        "supplier",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Storage Location</label>

                  <input
                    value={form.location}
                    onChange={(e) =>
                      updateField(
                        "location",
                        e.target.value
                      )
                    }
                  />
                </div>

              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    updateField(
                      "description",
                      e.target.value
                    )
                  }
                />
              </div>

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Updating..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}