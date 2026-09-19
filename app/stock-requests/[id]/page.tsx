export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  Package,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Page } from "@/components/Page";
import RequestDecision from "./RequestDecision";

type Props = {
  params: {
    id: string;
  };
};

export default async function StockRequestReviewPage({
  params,
}: Props) {
  /* =========================================
     GET STOCK REQUEST
     ========================================= */

  const { data: request, error: requestError } =
    await supabase
      .from("stock_requests")
      .select(`
        id,
        request_number,
        quantity_requested,
        quantity_issued,
        status,
        priority,
        reason,
        notes,
        requested_at,
        processed_at,
        requesting_department_id,
        requested_item_id,
        unit_id,
        departments:requesting_department_id (
          id,
          name
        ),
        inventory_items:requested_item_id (
          id,
          name,
          item_code,
          category,
          description
        ),
        units_of_measure:unit_id (
          id,
          name,
          abbreviation
        )
      `)
      .eq("id", params.id)
      .single();

  if (requestError || !request) {
    notFound();
  }

  /* =========================================
     EXTRACT RELATED DATA
     ========================================= */

  const department = Array.isArray(request.departments)
    ? request.departments[0]
    : request.departments;

  const item = Array.isArray(request.inventory_items)
    ? request.inventory_items[0]
    : request.inventory_items;

  const unit = Array.isArray(request.units_of_measure)
    ? request.units_of_measure[0]
    : request.units_of_measure;

  /* =========================================
     FIND STOREROOM
     ========================================= */

  const { data: storeroom } = await supabase
    .from("departments")
    .select("id, name")
    .eq("name", "Storeroom / Maintenance")
    .single();

  /* =========================================
     CHECK STOREROOM STOCK
     ========================================= */

  let storeroomStock = null;

  if (storeroom && item) {
    const { data } = await supabase
      .from("inventory_items")
      .select(`
        id,
        name,
        item_code,
        quantity,
        unit_id,
        location,
        minimum_level,
        reorder_level,
        units_of_measure (
          name,
          abbreviation
        )
      `)
      .eq("department_id", storeroom.id)
      .eq("item_code", item.item_code)
      .eq("is_active", true)
      .maybeSingle();

    storeroomStock = data;
  }

  const requestedQuantity = Number(
    request.quantity_requested
  );

  const availableQuantity = Number(
    storeroomStock?.quantity ?? 0
  );

  const canFullySupply =
    availableQuantity >= requestedQuantity;

  const canPartiallySupply =
    availableQuantity > 0 &&
    availableQuantity < requestedQuantity;

  /* =========================================
     STATUS HELPERS
     ========================================= */

  function getStatusClass(status: string) {
    switch (status) {
      case "Pending":
        return "request-status pending";

      case "Approved":
        return "request-status approved";

      case "Partially Issued":
        return "request-status partial";

      case "Issued":
        return "request-status issued";

      case "Rejected":
        return "request-status rejected";

      case "Cancelled":
        return "request-status cancelled";

      default:
        return "request-status";
    }
  }

  function getPriorityClass(priority: string) {
    switch (priority) {
      case "Critical":
        return "request-priority critical";

      case "High":
        return "request-priority high";

      case "Low":
        return "request-priority low";

      default:
        return "request-priority normal";
    }
  }

  return (
    <Page title="Review Stock Request">

      {/* =========================================
          PAGE HEADER
          ========================================= */}

      <div className="pagehead">
        <div>
          <Link
            href="/stock-requests"
            className="back-link"
          >
            <ArrowLeft size={15} />
            Back to Stock Requests
          </Link>

          <h1>Review Stock Request</h1>

          <p>
            Review the department request and determine
            how the stock should be supplied.
          </p>
        </div>
      </div>


      {/* =========================================
          REQUEST HEADER
          ========================================= */}

      <div className="request-review-header card">

        <div className="request-review-header-main">

          <div className="request-review-icon">
            <ClipboardList size={24} />
          </div>

          <div>
            <span className="request-review-label">
              REQUEST NUMBER
            </span>

            <h2>
              {request.request_number}
            </h2>
          </div>

        </div>

        <div className="request-review-header-status">

          <span
            className={getPriorityClass(
              request.priority
            )}
          >
            {request.priority} Priority
          </span>

          <span
            className={getStatusClass(
              request.status
            )}
          >
            {request.status}
          </span>

        </div>

      </div>


      {/* =========================================
          MAIN GRID
          ========================================= */}

      <div className="request-review-grid">

        {/* REQUEST DETAILS */}

        <div className="card request-review-card">

          <div className="request-review-card-title">
            <div className="request-review-title-icon">
              <ClipboardList size={18} />
            </div>

            <div>
              <h2>Request Details</h2>
              <p>Information submitted by the department.</p>
            </div>
          </div>


          <div className="request-detail-grid">

            <div className="request-detail">
              <span>Requesting Department</span>

              <strong>
                <Building2 size={15} />
                {department?.name || "—"}
              </strong>
            </div>


            <div className="request-detail">
              <span>Requested Item</span>

              <strong>
                <Package size={15} />
                {item?.name || "—"}
              </strong>
            </div>


            <div className="request-detail">
              <span>Item Code</span>

              <strong>
                {item?.item_code || "—"}
              </strong>
            </div>


            <div className="request-detail">
              <span>Quantity Requested</span>

              <strong>
                {request.quantity_requested}{" "}
                {unit?.abbreviation}
              </strong>
            </div>


            <div className="request-detail">
              <span>Quantity Already Issued</span>

              <strong>
                {request.quantity_issued}{" "}
                {unit?.abbreviation}
              </strong>
            </div>


            <div className="request-detail">
              <span>Date Requested</span>

              <strong>
                <Clock size={15} />

                {new Date(
                  request.requested_at
                ).toLocaleDateString()}
              </strong>
            </div>

          </div>


          {request.reason && (
            <div className="request-text-section">
              <span>Reason</span>
              <p>{request.reason}</p>
            </div>
          )}


          {request.notes && (
            <div className="request-text-section">
              <span>Additional Notes</span>
              <p>{request.notes}</p>
            </div>
          )}

        </div>


        {/* STOREROOM CHECK */}

        <div className="card request-review-card">

          <div className="request-review-card-title">
            <div className="request-review-title-icon">
              <Package size={18} />
            </div>

            <div>
              <h2>Storeroom Availability</h2>
              <p>
                Check whether Storeroom can fulfil this request.
              </p>
            </div>
          </div>


          {storeroomStock ? (

            <>

              <div className="storeroom-stock-panel">

                <div className="storeroom-stock-item">

                  <span>Item</span>

                  <strong>
                    {storeroomStock.name}
                  </strong>

                </div>


                <div className="storeroom-stock-item">

                  <span>Available Stock</span>

                  <strong className="stock-quantity">
                    {storeroomStock.quantity}{" "}


                   {(() => {
  const storeroomUnit = Array.isArray(
    storeroomStock.units_of_measure
  )
    ? storeroomStock.units_of_measure[0]
    : storeroomStock.units_of_measure;

  return storeroomUnit?.abbreviation || "";
})()}


                  </strong>

                </div>


                <div className="storeroom-stock-item">

                  <span>Requested</span>

                  <strong>
                    {requestedQuantity}{" "}
                    {unit?.abbreviation}
                  </strong>

                </div>


                <div className="storeroom-stock-item">

                  <span>Location</span>

                  <strong>
                    {storeroomStock.location || "Not specified"}
                  </strong>

                </div>

              </div>


              {/* FULL SUPPLY */}

              {canFullySupply && (
                <div className="availability-result availability-success">

                  <CheckCircle2 size={22} />

                  <div>
                    <strong>
                      Storeroom can fulfil this request
                    </strong>

                    <p>
                      There is enough stock available to issue
                      the full requested quantity.
                    </p>
                  </div>

                </div>
              )}


              {/* PARTIAL SUPPLY */}

              {canPartiallySupply && (
                <div className="availability-result availability-warning">

                  <AlertTriangle size={22} />

                  <div>
                    <strong>
                      Partial supply available
                    </strong>

                    <p>
                      Storeroom has {availableQuantity}{" "}
                      {unit?.abbreviation}, but the department
                      requested {requestedQuantity}{" "}
                      {unit?.abbreviation}.
                    </p>
                  </div>

                </div>
              )}


              {/* NO SUPPLY */}

              {availableQuantity <= 0 && (
                <div className="availability-result availability-danger">

                  <AlertTriangle size={22} />

                  <div>
                    <strong>
                      Purchase required
                    </strong>

                    <p>
                      Storeroom does not currently have this
                      item available.
                    </p>
                  </div>

                </div>
              )}

            </>

          ) : (

            <div className="availability-result availability-danger">

              <AlertTriangle size={22} />

              <div>
                <strong>
                  Item not available in Storeroom
                </strong>

                <p>
                  No matching stock item was found in
                  Storeroom / Maintenance.
                </p>
              </div>

            </div>

          )}

        </div>

      </div>


      {/* =========================================
          PROCUREMENT DECISION
          ========================================= */}

      <div className="card procurement-decision-card">

        <div>
          <span className="request-review-label">
            PROCUREMENT DECISION
          </span>

          <h2>
            {canFullySupply
              ? "Issue stock from Storeroom"
              : canPartiallySupply
              ? "Partial issue and purchase remaining stock"
              : "Purchase stock required"}
          </h2>

          <p>
            {canFullySupply
              ? "Storeroom has enough stock to satisfy the department request."
              : canPartiallySupply
              ? "Storeroom can provide part of the request. The remaining quantity will need to be purchased."
              : "The requested item is not available in sufficient quantity in Storeroom."}
          </p>
        </div>

        <div className="procurement-decision-badge">
          {canFullySupply ? (
            <>
              <CheckCircle2 size={18} />
              Storeroom Available
            </>
          ) : (
            <>
              <AlertTriangle size={18} />
              Purchase Required
            </>
          )}
        </div>

        <RequestDecision
          requestId={request.id}
          currentStatus={request.status}
          canFullySupply={canFullySupply}
          canPartiallySupply={canPartiallySupply}
       />

      </div>

    </Page>
  );
}