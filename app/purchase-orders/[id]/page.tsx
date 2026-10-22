"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Page } from "@/components/Page";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default async function PurchaseOrderReview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: purchaseOrder, error } = await supabase
    .from("purchase_orders")
    .select(`
      id,
      po_number,
      supplier,
      status,
      order_date,
      expected_date,
      total_amount,
      notes,
      approval_comment,
      approved_at,
      stock_request_id,
      departments:requesting_department_id (
        name
      ),
      purchase_order_items (
        id,
        quantity,
        unit_price,
        total_price,
        quantity_received,
        quantity_issued,
        inventory_items (
          name,
          item_code
        ),
        units_of_measure:unit_id (
          name,
          abbreviation
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !purchaseOrder) {
    notFound();
  }

console.log("PURCHASE ORDER DATA:", purchaseOrder);

  return (
    <PurchaseOrderReviewClient
      purchaseOrder={purchaseOrder}
    />
  );
}

function PurchaseOrderReviewClient({
  purchaseOrder,
}: {
  purchaseOrder: any;
}) {
  const router = useRouter();

  const [comment, setComment] = useState(
    purchaseOrder.approval_comment || ""
  );

  const [receiveQuantities, setReceiveQuantities] =
    useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const department = Array.isArray(
    purchaseOrder.departments
  )
    ? purchaseOrder.departments[0]
    : purchaseOrder.departments;

  // ----------------------------------------
  // MANAGEMENT DECISION
  // ----------------------------------------

  async function handleDecision(
    decision: "Approved" | "Declined"
  ) {
    setError("");
    setMessage("");

    if (
      decision === "Declined" &&
      !comment.trim()
    ) {
      setError(
        "Please provide a reason before declining the Purchase Order."
      );
      return;
    }

    try {
      setLoading(true);

      const { error: updateError } = await supabase
        .from("purchase_orders")
        .update({
          status: decision,
          approval_comment:
            comment.trim() || null,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", purchaseOrder.id)
        .eq("status", "Pending Approval");

      if (updateError) {
        throw updateError;
      }

      if (decision === "Approved") {
        setMessage(
          "Purchase Order approved successfully. Procurement can now place the supplier order."
        );
      } else {
        setMessage(
          "Purchase Order declined. Procurement cannot place the supplier order."
        );
      }

      router.refresh();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Something went wrong while recording the decision."
      );
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------
  // PLACE SUPPLIER ORDER
  // ----------------------------------------

  async function placeSupplierOrder() {
    setError("");
    setMessage("");

    try {
      setLoading(true);

      const { error: orderError } = await supabase
        .from("purchase_orders")
        .update({
          status: "Ordered",
          updated_at: new Date().toISOString(),
        })
        .eq("id", purchaseOrder.id)
        .eq("status", "Approved");

      if (orderError) {
        throw orderError;
      }

      setMessage(
        "Purchase Order marked as Ordered. Procurement can now proceed with the supplier."
      );

      router.refresh();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Something went wrong while placing the order."
      );
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------
  // RECEIVE GOODS
  // ----------------------------------------
async function receiveGoods(
  item: any,
  remaining: number,
  received: number,
  unitAbbreviation: string
) {
  setError("");
  setMessage("");

  const quantityNow = Number(
    receiveQuantities[item.id]
  );

  if (!quantityNow || quantityNow <= 0) {
    setError(
      "Please enter a valid received quantity."
    );
    return;
  }

  if (quantityNow > remaining) {
    setError(
      `You cannot receive more than the remaining ${remaining} ${unitAbbreviation}.`
    );
    return;
  }

  try {
    setLoading(true);

    const newReceived =
      received + quantityNow;

    /*
     * ------------------------------------------------
     * 1. GET THE PO ITEM'S INVENTORY INFORMATION
     * ------------------------------------------------
     */

    const {
      data: poItem,
      error: poItemError,
    } = await supabase
      .from("purchase_order_items")
      .select(`
        id,
        quantity,
        quantity_received,
        unit_id,
        unit_price,
        inventory_items (
          id,
          name,
          item_code,
          category,
          description,
          supplier,
          location,
          minimum_level,
          reorder_level,
          maximum_level,
          unit_cost
        )
      `)
      .eq("id", item.id)
      .single();

    if (poItemError) {
      throw poItemError;
    }

    if (!poItem) {
      throw new Error(
        "Purchase Order item could not be found."
      );
    }

    const inventoryItem = Array.isArray(
      poItem.inventory_items
    )
      ? poItem.inventory_items[0]
      : poItem.inventory_items;

    if (!inventoryItem) {
      throw new Error(
        "The inventory item linked to this Purchase Order could not be found."
      );
    }

    /*
     * ------------------------------------------------
     * 2. FIND PROCUREMENT DEPARTMENT
     * ------------------------------------------------
     */

    const {
      data: procurementDepartment,
      error:
        procurementDepartmentError,
    } = await supabase
      .from("departments")
      .select("id, name")
      .eq("name", "Procurement")
      .single();

    if (procurementDepartmentError) {
      throw procurementDepartmentError;
    }

    if (!procurementDepartment) {
      throw new Error(
        "Procurement department could not be found."
      );
    }

    /*
     * ------------------------------------------------
     * 3. CHECK WHETHER ITEM ALREADY EXISTS
     *    IN PROCUREMENT INVENTORY
     * ------------------------------------------------
     */
 
    const {
      data: procurementItem,
      error:
        procurementItemError,
    } = await supabase
      .from("inventory_items")
      .select("*")
      .eq(
        "department_id",
        procurementDepartment.id
      )
      .eq(
        "item_code",
        inventoryItem.item_code
      )
      .maybeSingle();

    if (procurementItemError) {
      throw procurementItemError;
    }

    let procurementInventoryItemId: string;

    /*
     * ------------------------------------------------
     * 4A. ITEM EXISTS
     *     INCREASE PROCUREMENT STOCK
     * ------------------------------------------------
     */

    if (procurementItem) {
      const newProcurementQuantity =
        Number(
          procurementItem.quantity || 0
        ) + quantityNow;

      const {
        error: updateInventoryError,
      } = await supabase
        .from("inventory_items")
        .update({
          quantity:
            newProcurementQuantity,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          procurementItem.id
        );

      if (updateInventoryError) {
        throw updateInventoryError;
      }

      procurementInventoryItemId =
        procurementItem.id;
    }

    /*
     * ------------------------------------------------
     * 4B. ITEM DOES NOT EXIST
     *     CREATE PROCUREMENT STOCK
     * ------------------------------------------------
     */

    else {
      const {
        data: newProcurementItem,
        error:
          createInventoryError,
      } = await supabase
        .from("inventory_items")
        .insert({
          department_id:
            procurementDepartment.id,

          name:
            inventoryItem.name,

          item_code:
            inventoryItem.item_code,

          category:
            inventoryItem.category,

          description:
            inventoryItem.description,

          quantity:
            quantityNow,

          unit_id:
            poItem.unit_id,

          minimum_level:
            inventoryItem.minimum_level ||
            0,

          reorder_level:
            inventoryItem.reorder_level ||
            0,

          maximum_level:
            inventoryItem.maximum_level,

          supplier:
            purchaseOrder.supplier ||
            inventoryItem.supplier,

          location:
            "Procurement",

          is_active: true,

          unit_cost:
            Number(
              poItem.unit_price ||
                inventoryItem.unit_cost ||
                0
            ),

          created_at:
            new Date().toISOString(),

          updated_at:
            new Date().toISOString(),
        })
        .select()
        .single();

      if (createInventoryError) {
        throw createInventoryError;
      }

      if (!newProcurementItem) {
        throw new Error(
          "Procurement inventory item could not be created."
        );
      }

      procurementInventoryItemId =
        newProcurementItem.id;
    }

    /*
     * ------------------------------------------------
     * 5. UPDATE PO ITEM RECEIVED QUANTITY
     * ------------------------------------------------
     */

    const {
      error: receiveError,
    } = await supabase
      .from("purchase_order_items")
      .update({
        quantity_received:
          newReceived,
      })
      .eq(
        "id",
        item.id
      );

    if (receiveError) {
      throw receiveError;
    }

    /*
     * ------------------------------------------------
     * 6. RECORD STOCK MOVEMENT
     * ------------------------------------------------
     */

    const {
      error: movementError,
    } = await supabase
      .from("stock_movements")
      .insert({
        item_id:
          procurementInventoryItemId,

        from_department_id:
          null,

        to_department_id:
          procurementDepartment.id,

        quantity:
          quantityNow,

        movement_type:
          "Receive",

        reference_number:
          purchaseOrder.po_number,

        reason:
          "Supplier delivery received by Procurement",

        notes:
          `Received ${quantityNow} ${unitAbbreviation} from supplier.`,
      });

    if (movementError) {
      throw movementError;
    }

    /*
     * ------------------------------------------------
     * 7. GET ALL PO ITEMS
     * ------------------------------------------------
     */

    const {
      data: allItems,
      error: itemsError,
    } = await supabase
      .from("purchase_order_items")
      .select(
        "quantity, quantity_received"
      )
      .eq(
        "purchase_order_id",
        purchaseOrder.id
      );

    if (itemsError) {
      throw itemsError;
    }

    /*
     * ------------------------------------------------
     * 8. DETERMINE PO STATUS
     * ------------------------------------------------
     */

    const allReceived =
      allItems &&
      allItems.length > 0 &&
      allItems.every(
        (poItem: any) => {
          const ordered =
            Number(
              poItem.quantity || 0
            );

          const received =
            Number(
              poItem.quantity_received ||
                0
            );

          return received >= ordered;
        }
      );

    const someReceived =
      allItems?.some(
        (poItem: any) =>
          Number(
            poItem.quantity_received ||
              0
          ) > 0
      ) ?? false;

    let newStatus:
      | "Ordered"
      | "Partially Received"
      | "Received";

    if (allReceived) {
      newStatus = "Received";
    } else if (someReceived) {
      newStatus =
        "Partially Received";
    } else {
      newStatus = "Ordered";
    }

    /*
     * ------------------------------------------------
     * 9. UPDATE PURCHASE ORDER STATUS
     * ------------------------------------------------
     */

    const {
      error: statusError,
    } = await supabase
      .from("purchase_orders")
      .update({
        status: newStatus,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        purchaseOrder.id
      );

    if (statusError) {
      throw statusError;
    }

    /*
     * ------------------------------------------------
     * 10. SUCCESS MESSAGE
     * ------------------------------------------------
     */

    setMessage(
      `${quantityNow} ${unitAbbreviation} received by Procurement. Purchase Order status: ${newStatus}.`
    );

    setReceiveQuantities(
      (previous) => ({
        ...previous,
        [item.id]: "",
      })
    );

    router.refresh();
  } catch (err: any) {
    console.error(err);

    setError(
      err?.message ||
        "Something went wrong while receiving the goods."
    );
  } finally {
    setLoading(false);
  }
}

  // ----------------------------------------
  // ISSUE GOODS TO REQUESTING DEPARTMENT
  // ----------------------------------------

  async function issueGoodsToDepartment(
    item: any,
    availableToIssue: number,
    unitAbbreviation: string
  ) {
    setError("");
    setMessage("");

    const quantityNow = Number(
      receiveQuantities[`issue-${item.id}`]
    );

    if (!quantityNow || quantityNow <= 0) {
      setError("Please enter a valid quantity to issue.");
      return;
    }

    if (quantityNow > availableToIssue) {
      setError(
        `You cannot issue more than the available ${availableToIssue} ${unitAbbreviation}.`
      );
      return;
    }

    try {
      setLoading(true);

      // ----------------------------------------
      // 1. FIND PROCUREMENT INVENTORY ITEM
      // ----------------------------------------

      const { data: procurementDepartment, error: procurementError } =
        await supabase
          .from("departments")
          .select("id, name")
          .eq("name", "Procurement")
          .single();

      if (procurementError) throw procurementError;

      if (!procurementDepartment) {
        throw new Error("Procurement department could not be found.");
      }

      const { data: procurementItem, error: procurementItemError } =
        await supabase
          .from("inventory_items")
          .select("*")
          .eq("department_id", procurementDepartment.id)
          .eq(
            "item_code",
            (
              Array.isArray(item.inventory_items)
                ? item.inventory_items[0]
                : item.inventory_items
            )?.item_code
          )
          .single();

      if (procurementItemError) throw procurementItemError;

      if (!procurementItem) {
        throw new Error(
          "The item could not be found in Procurement inventory."
        );
      }

      // ----------------------------------------
      // 2. CHECK PROCUREMENT STOCK
      // ----------------------------------------

      if (Number(procurementItem.quantity) < quantityNow) {
        throw new Error(
          `Procurement only has ${procurementItem.quantity} ${unitAbbreviation} available.`
        );
      }

      // ----------------------------------------
      // 3. FIND REQUESTING DEPARTMENT
      // ----------------------------------------

      if (!purchaseOrder.stock_request_id) {
        throw new Error(
          "This Purchase Order is not linked to a Stock Request."
        );
      }

      const { data: stockRequest, error: requestError } =
        await supabase
          .from("stock_requests")
          .select(`
            id,
            requesting_department_id,
            requested_item_id,
            quantity_requested,
            quantity_issued
          `)
          .eq("id", purchaseOrder.stock_request_id)
          .single();

      if (requestError) throw requestError;

      if (!stockRequest) {
        throw new Error("The linked Stock Request could not be found.");
      }

      // ----------------------------------------
      // 4. FIND / CREATE DEPARTMENT INVENTORY
      // ----------------------------------------

      const inventoryItem = Array.isArray(item.inventory_items)
        ? item.inventory_items[0]
        : item.inventory_items;

      const { data: departmentItem, error: departmentItemError } =
        await supabase
          .from("inventory_items")
          .select("*")
          .eq(
            "department_id",
            stockRequest.requesting_department_id
          )
          .eq("item_code", inventoryItem?.item_code)
          .maybeSingle();

      if (departmentItemError) throw departmentItemError;

      let departmentInventoryItemId: string;

      if (departmentItem) {
        const newQuantity =
          Number(departmentItem.quantity || 0) + quantityNow;

        const { error: updateDepartmentError } =
          await supabase
            .from("inventory_items")
            .update({
              quantity: newQuantity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", departmentItem.id);

        if (updateDepartmentError) {
          throw updateDepartmentError;
        }

        departmentInventoryItemId = departmentItem.id;
      } else {
        const { data: newDepartmentItem, error: createDepartmentError } =
          await supabase
            .from("inventory_items")
            .insert({
              department_id:
                stockRequest.requesting_department_id,

              name: inventoryItem?.name,

              item_code: inventoryItem?.item_code,

              category: inventoryItem?.category,

              description: inventoryItem?.description,

              quantity: quantityNow,

              unit_id: item.unit_id,

              minimum_level: inventoryItem?.minimum_level || 0,

              reorder_level: inventoryItem?.reorder_level || 0,

              maximum_level: inventoryItem?.maximum_level,

              supplier: purchaseOrder.supplier,

              location: "Department",

              is_active: true,

              unit_cost: Number(item.unit_price || 0),

              created_at: new Date().toISOString(),

              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (createDepartmentError) {
          throw createDepartmentError;
        }

        if (!newDepartmentItem) {
          throw new Error(
            "Department inventory item could not be created."
          );
        }

        departmentInventoryItemId = newDepartmentItem.id;
      }

      // ----------------------------------------
      // 5. REDUCE PROCUREMENT STOCK
      // ----------------------------------------

      const newProcurementQuantity =
        Number(procurementItem.quantity) - quantityNow;

      const { error: reduceProcurementError } =
        await supabase
          .from("inventory_items")
          .update({
            quantity: newProcurementQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", procurementItem.id);

      if (reduceProcurementError) {
        throw reduceProcurementError;
      }

      // ----------------------------------------
      // 6. UPDATE PO ITEM ISSUED QUANTITY
      // ----------------------------------------

      const currentIssued =
        Number(item.quantity_issued || 0);

      const newIssued = currentIssued + quantityNow;

      const { error: issuedError } =
        await supabase
          .from("purchase_order_items")
          .update({
            quantity_issued: newIssued,
          })
          .eq("id", item.id);

      if (issuedError) {
        throw issuedError;
      }

      // ----------------------------------------
      // 7. UPDATE STOCK REQUEST
      // ----------------------------------------

      const currentRequestIssued =
        Number(stockRequest.quantity_issued || 0);

      const newRequestIssued =
        currentRequestIssued + quantityNow;

      const requestStatus =
        newRequestIssued >=
        Number(stockRequest.quantity_requested)
          ? "Issued"
          : "Partially Issued";

      const { error: updateRequestError } =
        await supabase
          .from("stock_requests")
          .update({
            quantity_issued: newRequestIssued,
            status: requestStatus,
            processed_at: new Date().toISOString(),
          })
          .eq("id", stockRequest.id);

      if (updateRequestError) {
        throw updateRequestError;
      }

      // ----------------------------------------
      // 8. RECORD STOCK MOVEMENT
      // ----------------------------------------

      const { error: movementError } =
        await supabase
          .from("stock_movements")
          .insert({
            item_id: departmentInventoryItemId,

            from_department_id:
              procurementDepartment.id,

            to_department_id:
              stockRequest.requesting_department_id,

            quantity: quantityNow,

            movement_type: "Transfer",

            reference_number: purchaseOrder.po_number,

            reason:
              "Procurement issued supplier-delivered stock to requesting department.",

            notes:
              `Issued ${quantityNow} ${unitAbbreviation} from Procurement.`,
          });

      if (movementError) {
        throw movementError;
      }

      setMessage(
        `${quantityNow} ${unitAbbreviation} issued successfully to the requesting department.`
      );

      setReceiveQuantities((previous) => ({
        ...previous,
        [`issue-${item.id}`]: "",
      }));

      router.refresh();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Something went wrong while issuing the goods."
      );
    } finally {
      setLoading(false);
    }
  }
  /*async function receiveGoods(
    item: any,
    remaining: number,
    received: number,
    unitAbbreviation: string
  ) {
    setError("");
    setMessage("");

    const quantityNow = Number(
      receiveQuantities[item.id]
    );

    if (!quantityNow || quantityNow <= 0) {
      setError(
        "Please enter a valid received quantity."
      );
      return;
    }

    if (quantityNow > remaining) {
      setError(
        `You cannot receive more than the remaining ${remaining} ${unitAbbreviation}.`
      );
      return;
    }

    try {
      setLoading(true);

      const newReceived =
        received + quantityNow;

      // Update quantity received for this PO item
      const { error: receiveError } =
        await supabase
          .from("purchase_order_items")
          .update({
            quantity_received: newReceived,
          })
          .eq("id", item.id);

      if (receiveError) {
        throw receiveError;
      }

      // Get all items belonging to this PO
      const {
        data: allItems,
        error: itemsError,
      } = await supabase
        .from("purchase_order_items")
        .select(
          "quantity, quantity_received"
        )
        .eq(
          "purchase_order_id",
          purchaseOrder.id
        );

      if (itemsError) {
        throw itemsError;
      }

      // Check whether every PO item is fully received
      const allReceived =
        allItems?.every(
          (poItem: any) =>
            Number(
              poItem.quantity_received
            ) >=
            Number(poItem.quantity)
        ) ?? false;

      // Check whether at least some stock has been received
      const someReceived =
        allItems?.some(
          (poItem: any) =>
            Number(
              poItem.quantity_received
            ) > 0
        ) ?? false;

      let newStatus:
        | "Ordered"
        | "Partially Received"
        | "Received" = "Ordered";

      if (allReceived) {
        newStatus = "Received";
      } else if (someReceived) {
        newStatus = "Partially Received";
      }

      // Update Purchase Order status
      const {
        error: statusError,
      } = await supabase
        .from("purchase_orders")
        .update({
          status: newStatus,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          purchaseOrder.id
        );

      if (statusError) {
        throw statusError;
      }

      setMessage(
        `${quantityNow} ${unitAbbreviation} received successfully. Purchase Order status: ${newStatus}.`
      );

      setReceiveQuantities(
        (previous) => ({
          ...previous,
          [item.id]: "",
        })
      );

      router.refresh();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Something went wrong while receiving the goods."
      );
    } finally {
      setLoading(false);
    }
  }
*/
  return (
    <Page title="Purchase Order Review">
   {/* ----------------------------------------
    CORPORATE PURCHASE ORDER HEADER
----------------------------------------- */}

<div className="po-header">
  <Link
    href="/purchase-orders"
    className="po-header-back"
  >
    ← Back to Purchase Orders
  </Link>

  <div className="po-header-main">
    <div>
      <div className="po-header-eyebrow">
        Procurement / Purchase Order
      </div>

      <h1 className="po-header-title">
        {purchaseOrder.po_number}
      </h1>

      <div className="po-header-meta">
        <span>
          Supplier:{" "}
          <strong>
            {purchaseOrder.supplier || "Not specified"}
          </strong>
        </span>

        <span>•</span>

        <span>
          Department:{" "}
          <strong>
            {department?.name || "Not specified"}
          </strong>
        </span>
      </div>
    </div>

    <div className="po-header-status">
  <span
    className={`status-badge ${
      purchaseOrder.status === "Pending Approval"
        ? "status-pending-approval"
        : purchaseOrder.status === "Approved"
        ? "status-approved"
        : purchaseOrder.status === "Ordered"
        ? "status-ordered"
        : purchaseOrder.status === "Partially Received"
        ? "status-partially-received"
        : purchaseOrder.status === "Received"
        ? "status-received"
        : purchaseOrder.status === "Declined"
        ? "status-declined"
        : purchaseOrder.status === "Cancelled"
        ? "status-cancelled"
        : "status-pending"
    }`}
  >
    {purchaseOrder.status}
  </span>
</div>
  </div>
</div>

      {/* ----------------------------------------
          PURCHASE ORDER DETAILS
      ----------------------------------------- */}

  <div className="card po-summary-card">
  <div className="section-heading">
    <div>
      <div className="section-eyebrow">
        Purchase Order
      </div>

      <h2>Order Summary</h2>
    </div>
  </div>

  <div className="po-summary-grid">
    <div className="po-summary-item">
      <span className="po-summary-label">
        Supplier
      </span>

      <strong className="po-summary-value">
        {purchaseOrder.supplier || "Not specified"}
      </strong>
    </div>

    <div className="po-summary-item">
      <span className="po-summary-label">
        Requesting Department
      </span>

      <strong className="po-summary-value">
        {department?.name || "Not specified"}
      </strong>
    </div>

    <div className="po-summary-item">
      <span className="po-summary-label">
        Order Date
      </span>

      <strong className="po-summary-value">
        {purchaseOrder.order_date || "Not specified"}
      </strong>
    </div>

    <div className="po-summary-item">
      <span className="po-summary-label">
        Expected Delivery
      </span>

      <strong className="po-summary-value">
        {purchaseOrder.expected_date || "Not specified"}
      </strong>
    </div>

    <div className="po-summary-item po-summary-total">
      <span className="po-summary-label">
        Total Amount
      </span>

      <strong className="po-summary-value">
        M
        {Number(
          purchaseOrder.total_amount || 0
        ).toFixed(2)}
      </strong>
    </div>
  </div>
</div>
      

      {/* ----------------------------------------
          ITEMS
      ----------------------------------------- */}

 {/* ----------------------------------------
    ITEMS
----------------------------------------- */}

<div className="card po-items-card">
  <div className="section-heading">
    <div>
      <div className="section-eyebrow">
        Purchase Order
      </div>

      <h2>Items</h2>
    </div>
  </div>

  <div className="po-items-table">
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Code</th>
          <th>Quantity</th>
          <th>Unit Cost</th>
          <th>Total</th>
          <th>Received</th>
        </tr>
      </thead>

      <tbody>
        {purchaseOrder.purchase_order_items?.map(
          (item: any) => {
            const inventoryItem =
              Array.isArray(item.inventory_items)
                ? item.inventory_items[0]
                : item.inventory_items;

            const unit =
              Array.isArray(item.units_of_measure)
                ? item.units_of_measure[0]
                : item.units_of_measure;

            return (
              <tr key={item.id}>
                <td>
                  <div className="po-item-name">
                    {inventoryItem?.name ||
                      "Unknown item"}
                  </div>
                </td>

                <td>
                  <div className="po-item-code">
                    {inventoryItem?.item_code || "-"}
                  </div>
                </td>

                <td>
                  <span className="po-item-number">
                    {item.quantity}{" "}
                    {unit?.abbreviation || ""}
                  </span>
                </td>

                <td>
                  <span className="po-item-money">
                    M
                    {Number(
                      item.unit_price || 0
                    ).toFixed(2)}
                  </span>
                </td>

                <td>
                  <span className="po-item-total">
                    M
                    {Number(
                      item.total_price || 0
                    ).toFixed(2)}
                  </span>
                </td>

                <td>
                  <span className="po-item-received">
                    {item.quantity_received}{" "}
                    {unit?.abbreviation || ""}
                  </span>
                </td>
              </tr>
            );
          }
        )}
      </tbody>
    </table>
  </div>
</div>

      {/* ----------------------------------------
          NOTES
      ----------------------------------------- */}

      {purchaseOrder.notes && (
        <div className="card">
          <h2>Notes</h2>

          <p>
            {purchaseOrder.notes}
          </p>
        </div>
      )}

      {/* ----------------------------------------
          MANAGEMENT REVIEW
      ----------------------------------------- */}
    {purchaseOrder.status === "Pending Approval" && (
  <div className="card po-action-card po-management-card">
    <div className="po-action-header">
      <div>
        <div className="section-eyebrow">
          Management Review
        </div>

        <h2>Management Decision</h2>

        <p className="po-action-description">
          This Purchase Order is waiting for Management review.
          Review the order details before accepting or declining
          the purchase request.
        </p>
      </div>

      <div className="po-action-status">
        <span className="status-badge status-pending-approval">
          Pending Approval
        </span>
      </div>
    </div>

    <div className="po-action-divider" />

    <label className="po-comment-field">
      <span>Management Comment</span>

      <textarea
        value={comment}
        onChange={(e) =>
          setComment(e.target.value)
        }
        placeholder="Enter a comment or decision note..."
        rows={4}
      />
    </label>

    {error && (
      <div
        className="notice"
        style={{
          color: "#b91c1c",
        }}
      >
        {error}
      </div>
    )}

    <div className="po-action-footer">
      <div className="po-action-note">
        Your decision will update the Purchase Order status.
      </div>

      <div className="po-action-buttons">
        <button
          className="secondary"
          type="button"
          disabled={loading}
          onClick={() =>
            handleDecision("Declined")
          }
        >
          {loading
            ? "Processing..."
            : "Decline Purchase Order"}
        </button>

        <button
          className="primary"
          type="button"
          disabled={loading}
          onClick={() =>
            handleDecision("Approved")
          }
        >
          {loading
            ? "Processing..."
            : "Accept Purchase Order"}
        </button>
      </div>
    </div>

    {message && (
      <div className="notice">
        {message}
      </div>
    )}
  </div>
)}
    

      {/* ----------------------------------------
          PROCUREMENT ORDER ACTION
      ----------------------------------------- */}
{/* ----------------------------------------
    PROCUREMENT ORDER ACTION
----------------------------------------- */}

{purchaseOrder.status === "Approved" && (
  <div className="card po-action-card po-procurement-card">
    <div className="po-action-header">
      <div>
        <div className="section-eyebrow">
          Procurement
        </div>

        <h2>Place Supplier Order</h2>

        <p className="po-action-description">
          This Purchase Order has been approved by Management.
          Procurement can now place the order with the supplier.
        </p>
      </div>

      <div className="po-action-status">
        <span className="status-badge status-approved">
          Approved
        </span>
      </div>
    </div>

    <div className="po-action-divider" />

    <div className="po-procurement-summary">
      <div className="po-procurement-summary-item">
        <span className="po-summary-label">
          Supplier
        </span>

        <strong className="po-summary-value">
          {purchaseOrder.supplier || "Not specified"}
        </strong>
      </div>

      <div className="po-procurement-summary-item">
        <span className="po-summary-label">
          Expected Delivery
        </span>

        <strong className="po-summary-value">
          {purchaseOrder.expected_date || "Not specified"}
        </strong>
      </div>

      <div className="po-procurement-summary-item">
        <span className="po-summary-label">
          Order Total
        </span>

        <strong className="po-summary-value po-procurement-total">
          M
          {Number(
            purchaseOrder.total_amount || 0
          ).toFixed(2)}
        </strong>
      </div>
    </div>

    {error && (
      <div
        className="notice"
        style={{
          color: "#b91c1c",
        }}
      >
        {error}
      </div>
    )}

    <div className="po-action-footer">
      <div className="po-action-note">
        Placing the order will update the Purchase Order
        status to Ordered.
      </div>

      <div className="po-action-buttons">
        <button
          className="primary"
          type="button"
          onClick={placeSupplierOrder}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : "Place Supplier Order"}
        </button>
      </div>
    </div>

    {message && (
      <div className="notice">
        {message}
      </div>
    )}
  </div>
)}
      {/* ----------------------------------------
          RECEIVE GOODS
          IMPORTANT:
          Works for both Ordered and
          Partially Received
      ----------------------------------------- */}
    {/* ----------------------------------------
    RECEIVE GOODS
----------------------------------------- */}

{(purchaseOrder.status === "Ordered" ||
  purchaseOrder.status === "Partially Received") && (
  <div className="card po-receive-section">
    <div className="po-receive-header">
      <div>
        <div className="section-eyebrow">
          Goods Receiving
        </div>

        <h2>Receive Goods</h2>

        <p>
          Record quantities received from the supplier
          against this Purchase Order.
        </p>
      </div>

      <span
        className={`status-badge ${
          purchaseOrder.status === "Ordered"
            ? "status-ordered"
            : "status-partially-received"
        }`}
      >
        {purchaseOrder.status}
      </span>
    </div>

    <div className="po-receive-table-wrapper">
      <table className="po-receive-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Ordered</th>
            <th>Received</th>
            <th>Outstanding</th>
            <th>Receive Now</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {purchaseOrder.purchase_order_items?.map(
            (item: any) => {
              const inventoryItem =
                Array.isArray(item.inventory_items)
                  ? item.inventory_items[0]
                  : item.inventory_items;

              const unit =
                Array.isArray(item.units_of_measure)
                  ? item.units_of_measure[0]
                  : item.units_of_measure;

              const ordered = Number(
                item.quantity || 0
              );

              const received = Number(
                item.quantity_received || 0
              );

              const remaining =
                ordered - received;

              return (
                <tr
                  key={item.id}
                  className={
                    remaining <= 0
                      ? "po-receive-row-complete"
                      : ""
                  }
                >
                  <td>
                    <div className="po-receive-item">
                      <strong>
                        {inventoryItem?.name ||
                          "Unknown item"}
                      </strong>

                      <span>
                        {inventoryItem?.item_code ||
                          "-"}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span className="po-receive-number">
                      {ordered}{" "}
                      {unit?.abbreviation || ""}
                    </span>
                  </td>

                  <td>
                    <span className="po-receive-number received">
                      {received}{" "}
                      {unit?.abbreviation || ""}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`po-receive-number ${
                        remaining > 0
                          ? "outstanding"
                          : "complete"
                      }`}
                    >
                      {remaining}{" "}
                      {unit?.abbreviation || ""}
                    </span>
                  </td>

                  <td>
                    {remaining > 0 ? (
                      <input
                        className="po-receive-input"
                        type="number"
                        min="0"
                        max={remaining}
                        step="0.01"
                        value={
                          receiveQuantities[
                            item.id
                          ] || ""
                        }
                        onChange={(e) => {
                          setReceiveQuantities(
                            (previous) => ({
                              ...previous,
                              [item.id]:
                                e.target.value,
                            })
                          );
                        }}
                        placeholder="0"
                      />
                    ) : (
                      <span className="po-receive-done">
                        Complete
                      </span>
                    )}
                  </td>

                  <td className="po-receive-action">
                    {remaining > 0 && (
                      <button
                        className="primary"
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          receiveGoods(
                            item,
                            remaining,
                            received,
                            unit?.abbreviation ||
                              ""
                          )
                        }
                      >
                        {loading
                          ? "Processing..."
                          : "Receive"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>

    {error && (
      <div
        className="notice"
        style={{
          color: "#b91c1c",
        }}
      >
        {error}
      </div>
    )}

    {message && (
      <div className="notice">
        {message}
      </div>
    )}
  </div>
)}

          {/* ----------------------------------------
          ISSUE GOODS TO REQUESTING DEPARTMENT
      ----------------------------------------- */}
    {/* ----------------------------------------
    ISSUE GOODS TO DEPARTMENT
----------------------------------------- */}

{(purchaseOrder.status === "Received" ||
  purchaseOrder.status === "Partially Received") && (
  <div className="card po-issue-section">
    <div className="po-issue-header">
      <div>
        <div className="section-eyebrow">
          Stock Dispatch
        </div>

        <h2>Issue Goods to Department</h2>

        <p>
          Issue received goods from Procurement to the
          department that requested them.
        </p>
      </div>

      <div className="po-issue-department">
        <span>Requesting Department</span>
        <strong>
          {department?.name || "Not specified"}
        </strong>
      </div>
    </div>

    <div className="po-issue-table-wrapper">
      <table className="po-issue-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Received</th>
            <th>Already Issued</th>
            <th>Available</th>
            <th>Issue Now</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {purchaseOrder.purchase_order_items?.map(
            (item: any) => {
              const inventoryItem =
                Array.isArray(item.inventory_items)
                  ? item.inventory_items[0]
                  : item.inventory_items;

              const unit =
                Array.isArray(item.units_of_measure)
                  ? item.units_of_measure[0]
                  : item.units_of_measure;

              const received = Number(
                item.quantity_received || 0
              );

              const issued = Number(
                item.quantity_issued || 0
              );

              const availableToIssue =
                received - issued;

              return (
                <tr
                  key={item.id}
                  className={
                    availableToIssue <= 0
                      ? "po-issue-row-complete"
                      : ""
                  }
                >
                  <td>
                    <div className="po-issue-item">
                      <strong>
                        {inventoryItem?.name ||
                          "Unknown item"}
                      </strong>

                      <span>
                        {inventoryItem?.item_code ||
                          "-"}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span className="po-issue-number">
                      {received}{" "}
                      {unit?.abbreviation || ""}
                    </span>
                  </td>

                  <td>
                    <span className="po-issue-number issued">
                      {issued}{" "}
                      {unit?.abbreviation || ""}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`po-issue-number ${
                        availableToIssue > 0
                          ? "available"
                          : "complete"
                      }`}
                    >
                      {availableToIssue}{" "}
                      {unit?.abbreviation || ""}
                    </span>
                  </td>

                  <td>
                    {availableToIssue > 0 ? (
                      <input
                        className="po-issue-input"
                        type="number"
                        min="0"
                        max={availableToIssue}
                        step="0.01"
                        value={
                          receiveQuantities[
                            `issue-${item.id}`
                          ] || ""
                        }
                        onChange={(e) => {
                          setReceiveQuantities(
                            (previous) => ({
                              ...previous,
                              [`issue-${item.id}`]:
                                e.target.value,
                            })
                          );
                        }}
                        placeholder="0"
                      />
                    ) : (
                      <span className="po-issue-complete">
                        Fully Issued
                      </span>
                    )}
                  </td>

                  <td className="po-issue-action">
                    {availableToIssue > 0 && (
                      <button
                        className="primary"
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          issueGoodsToDepartment(
                            item,
                            availableToIssue,
                            unit?.abbreviation || ""
                          )
                        }
                      >
                        {loading
                          ? "Processing..."
                          : "Issue"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>

    {error && (
      <div
        className="notice"
        style={{
          color: "#b91c1c",
        }}
      >
        {error}
      </div>
    )}

    {message && (
      <div className="notice">
        {message}
      </div>
    )}
  </div>
)}
      {/* ----------------------------------------
          COMPLETED / DECISION INFORMATION
      ----------------------------------------- */}
    {/* ----------------------------------------
    COMPLETED / DECISION INFORMATION
----------------------------------------- */}

{purchaseOrder.status === "Declined" && (
  <div className="card po-decision-card po-decision-declined">
    <div className="po-decision-header">
      <div>
        <div className="section-eyebrow">
          Management Decision
        </div>

        <h2>Purchase Order Declined</h2>

        <p>
          This Purchase Order was declined by Management and
          cannot proceed to supplier ordering.
        </p>
      </div>

      <span className="status-badge status-declined">
        Declined
      </span>
    </div>

    {purchaseOrder.approval_comment && (
      <div className="po-decision-comment">
        <span>Management Comment</span>

        <p>
          {purchaseOrder.approval_comment}
        </p>
      </div>
    )}

    {purchaseOrder.approved_at && (
      <div className="po-decision-meta">
        Decision recorded:{" "}
        <strong>
          {new Date(
            purchaseOrder.approved_at
          ).toLocaleString()}
        </strong>
      </div>
    )}
  </div>
)}

{purchaseOrder.status === "Received" && (
  <div className="card po-completed-card">
    <div className="spo-completed-icon">
      ✓
    </div>

    <div className="po-completed-content">
      <div className="section-eyebrow">
        Goods Receiving
      </div>

      <h2>Purchase Order Received</h2>

      <p>
        All items on this Purchase Order have been received
        by Procurement and are now available for issue to the
        requesting department.
      </p>
    </div>

    <span className="status-badge status-received">
      Received
    </span>
  </div>
)}

    </Page>
  );
}