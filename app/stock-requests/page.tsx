export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { ClipboardList, Clock, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Page } from "@/components/Page";

export default async function StockRequestsPage() {
  const { data: requests, error } = await supabase
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
      departments:requesting_department_id (
        name
      ),
      inventory_items:requested_item_id (
        name,
        item_code
      ),
      units_of_measure:unit_id (
        name,
        abbreviation
      )
    `)
    .order("requested_at", { ascending: false });

  if (error) {
    return (
      <Page title="Stock Requests">
        <div className="card">
          <h2>Unable to load stock requests</h2>
          <p>{error.message}</p>
        </div>
      </Page>
    );
  }

  const pendingCount =
    requests?.filter((request) => request.status === "Pending").length ?? 0;

  const approvedCount =
    requests?.filter((request) => request.status === "Approved").length ?? 0;

  const issuedCount =
    requests?.filter(
      (request) =>
        request.status === "Issued" ||
        request.status === "Partially Issued"
    ).length ?? 0;

  const rejectedCount =
    requests?.filter((request) => request.status === "Rejected").length ?? 0;

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
    <Page title="Stock Requests">
      <div className="pagehead">
        <div>
          <h1>Stock Requests</h1>

          <p>
            Review and manage stock requests submitted by departments.
          </p>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="inventory-summary stock-request-summary">
        <div className="summary-card">
          <span>Total Requests</span>
          <strong>{requests?.length ?? 0}</strong>
        </div>

        <div className="summary-card">
          <span>Pending Review</span>
          <strong>{pendingCount}</strong>
        </div>

        <div className="summary-card">
          <span>Approved</span>
          <strong>{approvedCount}</strong>
        </div>

        <div className="summary-card">
          <span>Issued</span>
          <strong>{issuedCount}</strong>
        </div>

        <div className="summary-card critical-summary">
          <span>Rejected</span>
          <strong>{rejectedCount}</strong>
        </div>
      </div>

      {/* REQUESTS TABLE */}
      <div className="card inventory-card stock-requests-card">
        <div className="inventory-toolbar">
          <div>
            <h2>All Stock Requests</h2>

            <p>
              Department requests requiring procurement review.
            </p>
          </div>
        </div>

        {requests && requests.length > 0 ? (
          <div className="table-wrapper">
            <table className="inventory-table stock-requests-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Department</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => {
                  const department = Array.isArray(request.departments)
                    ? request.departments[0]
                    : request.departments;

                  const item = Array.isArray(request.inventory_items)
                    ? request.inventory_items[0]
                    : request.inventory_items;

                  const unit = Array.isArray(request.units_of_measure)
                    ? request.units_of_measure[0]
                    : request.units_of_measure;

                  return (
                    <tr key={request.id}>
                      <td>
                        <strong>{request.request_number}</strong>
                      </td>

                      <td>
                        {department?.name || "—"}
                      </td>

                      <td>
                        <strong>{item?.name || "—"}</strong>

                        {item?.item_code && (
                          <small>{item.item_code}</small>
                        )}
                      </td>

                      <td>
                        <strong>
                          {request.quantity_requested}
                        </strong>{" "}
                        {unit?.abbreviation}
                      </td>

                      <td>
                        <span
                          className={getPriorityClass(
                            request.priority
                          )}
                        >
                          {request.priority}
                        </span>
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            request.status
                          )}
                        >
                          {request.status}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          request.requested_at
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <Link
                          href={`/stock-requests/${request.id}`}
                          className="table-action edit-action"
                        >
                          <ClipboardList
                            size={14}
                            strokeWidth={2}
                          />
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <ClipboardList size={32} />
            </div>

            <h3>No stock requests</h3>

            <p>
              There are currently no stock requests submitted by
              departments.
            </p>
          </div>
        )}
      </div>
    </Page>
  );
}