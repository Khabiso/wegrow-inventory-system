"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Page } from "@/components/Page";
import { supabase } from "@/lib/supabase";



export default async function POs() {

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: purchaseOrders, error,count, } = await supabase
  .from("purchase_orders")
  .select(
    `
      id,
      po_number,
      supplier,
      status,
      total_amount,
      purchase_order_items (
        quantity,
        inventory_items (
          name
        ),
        units_of_measure:unit_id (
          abbreviation
        )
      )
    `,
    { count: "exact" }
  )
  .order("created_at", { ascending: false })
  .range(from, to);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <Page title="Purchase Orders">
      <div className="po-list-header">
  <div className="po-list-header-main">
    <div className="po-list-eyebrow">
      Procurement Management
    </div>

    <h1 className="po-list-title">
      Purchase Orders
    </h1>

    <p className="po-list-description">
      Review and track purchase orders from Management approval
      through supplier delivery.
    </p>
  </div>


</div>

      {error && (
        <div className="notice">
          Unable to load Purchase Orders.
        </div>
      )}

      <div className="card po-list-table-card">
  <div className="po-list-table-wrapper">
    <table className="po-list-table"></table>
        <table>
          <thead>
            <tr>
              <th>Purchase Order</th>
              <th>Supplier</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {purchaseOrders?.map((po: any) => {
              const firstItem = po.purchase_order_items?.[0];

              const inventoryItem = Array.isArray(
                firstItem?.inventory_items
              )
                ? firstItem.inventory_items[0]
                : firstItem?.inventory_items;

              const unit = Array.isArray(
                firstItem?.units_of_measure
              )
                ? firstItem.units_of_measure[0]
                : firstItem?.units_of_measure;

              return (
                <tr key={po.id}>
                  <td>
                    <div className="po-list-number">
                      {po.po_number}
                    </div>
                    <div className="po-list-reference">
                     Purchase Order
                    </div>
                  </td>

                  <td>
                    <div className="po-list-supplier">
                      {po.supplier || "Not specified"}
                    </div>
                  </td>

                  <td>
                      <div className="po-list-item">
                          <div className="po-list-item-name">
                            {inventoryItem?.name || "Unknown item"}
                          </div>

                       <div className="po-list-item-code">
                             {inventoryItem?.item_code || "No item code"}
                         </div>
                    </div>
                  </td>

                  <td>
                     <span className="po-list-quantity">
                       {firstItem?.quantity || 0}{" "}
                       {unit?.abbreviation || ""}
                     </span>
                  </td>

                  <td>
                     <span className="po-list-total">
                       M{Number(po.total_amount || 0).toFixed(2)}
                     </span>
                 </td>

                  <td>
                    <span
                      className={`status-badge ${
                        po.status === "Pending Approval"
                          ? "status-pending-approval"
                          : po.status === "Approved"
                          ? "status-approved"
                          : po.status === "Ordered"
                          ? "status-ordered"
                          : po.status === "Partially Received"
                          ? "status-partially-received"
                          : po.status === "Received"
                          ? "status-received"
                          : po.status === "Declined"
                          ? "status-declined"
                          : po.status === "Cancelled"
                          ? "status-cancelled"
                          : "status-pending"
                       }`}
                      >
                       {po.status}
                    </span>
                  </td>

                 <td className="po-list-action">
                  <Link
                     href={`/purchase-orders/${po.id}`}
                     className="secondary po-list-review-button"
                  >
                    Review
                  </Link>
                 </td>
                </tr>
              );
            })}

            {purchaseOrders?.length === 0 && (
              <tr>
                <td colSpan={7}>
                  No Purchase Orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

    {totalPages > 1 && (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      marginTop: "20px",
      padding: "4px 0",
    }}
  >
    <button
      type="button"
      disabled={currentPage === 1}
      onClick={() =>
        setCurrentPage((page) => page - 1)
      }
      style={{
        height: "36px",
        padding: "0 14px",
        border: "1px solid #d6dfda",
        borderRadius: "7px",
        background:
          currentPage === 1 ? "#f5f7f6" : "#ffffff",
        color:
          currentPage === 1 ? "#a2aaa5" : "#34423a",
        fontSize: "12px",
        fontWeight: 700,
        cursor:
          currentPage === 1
            ? "not-allowed"
            : "pointer",
      }}
    >
      Previous
    </button>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
      }}
    >
      {Array.from(
        { length: totalPages },
        (_, index) => index + 1
      ).map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => setCurrentPage(page)}
          style={{
            width: "36px",
            height: "36px",
            border: `1px solid ${
              currentPage === page
                ? "#087f5b"
                : "#d6dfda"
            }`,
            borderRadius: "7px",
            background:
              currentPage === page
                ? "#087f5b"
                : "#ffffff",
            color:
              currentPage === page
                ? "#ffffff"
                : "#34423a",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {page}
        </button>
      ))}
    </div>

    <button
      type="button"
      disabled={currentPage === totalPages}
      onClick={() =>
        setCurrentPage((page) => page + 1)
      }
      style={{
        height: "36px",
        padding: "0 14px",
        border: "1px solid #d6dfda",
        borderRadius: "7px",
        background:
          currentPage === totalPages
            ? "#f5f7f6"
            : "#ffffff",
        color:
          currentPage === totalPages
            ? "#a2aaa5"
            : "#34423a",
        fontSize: "12px",
        fontWeight: 700,
        cursor:
          currentPage === totalPages
            ? "not-allowed"
            : "pointer",
      }}
    >
      Next
    </button> 
  </div>
)}
    </Page>
  );
}