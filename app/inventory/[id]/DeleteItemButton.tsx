"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  itemId: string;
  itemName: string;
};

export default function DeleteItemButton({
  itemId,
  itemName,
}: Props) {
  const router = useRouter();

  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${itemName}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    const { error } = await supabase
      .from("inventory_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      alert(`Unable to delete item: ${error.message}`);
      setDeleting(false);
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      className="table-action delete-action"
      onClick={handleDelete}
      disabled={deleting}
    >
      <Trash2 size={14} strokeWidth={2} />
      <span>{deleting ? "Deleting..." : "Delete"}</span>
    </button>
  );
}