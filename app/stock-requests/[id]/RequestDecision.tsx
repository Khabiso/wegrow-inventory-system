"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  PackageCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  requestId: string;
  currentStatus: string;
  canFullySupply?: boolean;
  canPartiallySupply?: boolean;
};

export default function RequestDecision({
  requestId,
  currentStatus,
  canFullySupply = false,
  canPartiallySupply = false,
}: Props) {
  const router = useRouter();

  const [processing, setProcessing] = useState(false);

  // =========================================
  // APPROVE / REJECT REQUEST
  // =========================================

  async function updateStatus(
    status: "Approved" | "Rejected"
  ) {
    const action =
      status === "Approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this stock request?`
    );

    if (!confirmed) {
      return;
    }

    setProcessing(true);

    const { error } = await supabase
      .from("stock_requests")
      .update({
        status,
        processed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      alert(
        `Unable to ${action} request: ${error.message}`
      );

      setProcessing(false);
      return;
    }

    router.refresh();
  }

  // =========================================
  // FULL ISSUE FROM STOREROOM
  // =========================================

  async function issueFromStoreroom() {
    const confirmed = window.confirm(
      "Are you sure you want to issue the requested stock from Storeroom?"
    );

    if (!confirmed) {
      return;
    }

    setProcessing(true);

    const { error } = await supabase.rpc(
      "issue_stock_from_storeroom",
      {
        p_request_id: requestId,
      }
    );

    if (error) {
      alert(
        `Unable to issue stock: ${error.message}`
      );

      setProcessing(false);
      return;
    }

    alert(
      "Stock successfully issued from Storeroom."
    );

    router.refresh();
  }

  // =========================================
  // PARTIAL ISSUE FROM STOREROOM
  // =========================================

  async function issuePartialFromStoreroom() {
    const confirmed = window.confirm(
      "Are you sure you want to issue the available Storeroom stock?"
    );

    if (!confirmed) {
      return;
    }

    setProcessing(true);

    const { error } = await supabase.rpc(
      "issue_partial_stock_from_storeroom",
      {
        p_request_id: requestId,
      }
    );

    if (error) {
      alert(
        `Unable to issue partial stock: ${error.message}`
      );

      setProcessing(false);
      return;
    }

    alert(
      "Available Storeroom stock has been issued successfully."
    );

    router.refresh();
  }

  // =========================================
  // PENDING REQUEST
  // =========================================

  if (currentStatus === "Pending") {
    return (
      <div className="request-decision-actions">

        <button
          type="button"
          className="request-decision-btn request-approve-btn"
          onClick={() => updateStatus("Approved")}
          disabled={processing}
        >
          <CheckCircle2 size={17} />

          {processing
            ? "Processing..."
            : "Approve Request"}
        </button>

        <button
          type="button"
          className="request-decision-btn request-reject-btn"
          onClick={() => updateStatus("Rejected")}
          disabled={processing}
        >
          <XCircle size={17} />

          Reject Request
        </button>

      </div>
    );
  }

  // =========================================
  // APPROVED + ENOUGH STOREROOM STOCK
  // =========================================

  if (
    currentStatus === "Approved" &&
    canFullySupply
  ) {
    return (
      <div className="request-decision-actions">

        <button
          type="button"
          className="request-decision-btn request-approve-btn"
          onClick={issueFromStoreroom}
          disabled={processing}
        >
          <PackageCheck size={17} />

          {processing
            ? "Issuing Stock..."
            : "Issue from Storeroom"}
        </button>

      </div>
    );
  }

  // =========================================
  // APPROVED + PARTIAL STOREROOM STOCK
  // =========================================

  if (
    currentStatus === "Approved" &&
    canPartiallySupply
  ) {
    return (
      <div className="request-decision-actions">

        <button
          type="button"
          className="request-decision-btn request-approve-btn"
          onClick={issuePartialFromStoreroom}
          disabled={processing}
        >
          <PackageCheck size={17} />

          {processing
            ? "Issuing Available Stock..."
            : "Issue Available Stock"}
        </button>

      </div>
    );
  }

  // =========================================
  // NO ACTION AVAILABLE
  // =========================================

  return null;
}