
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import type { CSSProperties } from "react";

import { Page } from "@/components/Page";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 10;

const paginationButton: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "34px",
  height: "34px",
  padding: "0 10px",
  border: "1px solid #dfe6ee",
  borderRadius: "7px",
  background: "#ffffff",
  color: "#475569",
  fontSize: "11px",
  fontWeight: 600,
  textDecoration: "none",
  boxSizing: "border-box",
};

function getMovementStyle(type: string) {
  switch (type) {
    case "Receive":
      return {
        background: "#eaf8f0",
        color: "#087f5b",
        border: "1px solid #c9ecd8",
      };

    case "Issue":
      return {
        background: "#fff5e9",
        color: "#b96b12",
        border: "1px solid #f6dfbd",
      };

    case "Transfer":
      return {
        background: "#eff4ff",
        color: "#315db5",
        border: "1px solid #d8e4ff",
      };

    case "Return":
      return {
        background: "#f3edff",
        color: "#7041b8",
        border: "1px solid #e4d8ff",
      };

    case "Adjustment":
      return {
        background: "#fff0f0",
        color: "#c24141",
        border: "1px solid #f8d5d5",
      };

    default:
      return {
        background: "#f1f5f9",
        color: "#475569",
        border: "1px solid #e2e8f0",
      };
  }
}

export default async function Movements({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // =========================================
  // PAGINATION PARAMETERS
  // =========================================

  const params = await searchParams;

  const requestedPage = Number(params.page || "1");

  const safePage =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  // =========================================
  // LOAD TOTAL MOVEMENT COUNTS
  // =========================================

  const [
    { count: totalCount, error: countError },
    { count: receivedCount },
    { count: issuedCount },
  ] = await Promise.all([
    supabase
      .from("stock_movements")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("stock_movements")
      .select("id", { count: "exact", head: true })
      .eq("movement_type", "Receive"),

    supabase
      .from("stock_movements")
      .select("id", { count: "exact", head: true })
      .eq("movement_type", "Issue"),
  ]);

  if (countError) {
    return (
      <Page title="Stock Movements">
        <div className="card">
          <h2>Unable to load stock movements</h2>
          <p>{countError.message}</p>
        </div>
      </Page>
    );
  }

  const totalMovements = totalCount || 0;

  const totalPages = Math.max(
    1,
    Math.ceil(totalMovements / PAGE_SIZE)
  );

  const currentPage = Math.min(safePage, totalPages);

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // =========================================
  // LOAD CURRENT PAGE MOVEMENTS
  // =========================================

  const { data: movements, error } = await supabase
    .from("stock_movements")
    .select(`
      id,
      quantity,
      movement_type,
      reference_number,
      reason,
      notes,
      created_at,
      from_department:from_department_id (
        name
      ),
      to_department:to_department_id (
        name
      ),
      item:item_id (
        name,
        item_code,
        units_of_measure (
          abbreviation
        )
      )
    `)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return (
      <Page title="Stock Movements">
        <div className="card">
          <h2>Unable to load stock movements</h2>
          <p>{error.message}</p>
        </div>
      </Page>
    );
  }

  const records = movements || [];

  // =========================================
  // GET SUPPLIER DETAILS FOR RECEIPTS
  // =========================================

  const poNumbers = records
    .map((movement) => movement.reference_number)
    .filter((value): value is string => Boolean(value));

  const supplierMap: Record<string, string> = {};

  if (poNumbers.length > 0) {
    const { data: purchaseOrders } = await supabase
      .from("purchase_orders")
      .select(`
        po_number,
        supplier
      `)
      .in("po_number", poNumbers);

    purchaseOrders?.forEach((po) => {
      supplierMap[po.po_number] = po.supplier || "Supplier";
    });
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <Page title="Stock Movements">

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          width: "100%",
          minWidth: 0,
        }}
      >

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            padding: "28px",
            background: "linear-gradient(115deg, #17213c, #20264f)",
            borderRadius: "16px",
            color: "#ffffff",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "1.5px",
                color: "#aebbd1",
                marginBottom: "10px",
              }}
            >
              INVENTORY CONTROL / TRANSACTIONS
            </div>

            <h1
              style={{
                fontSize: "26px",
                fontWeight: 800,
                margin: "0 0 8px",
                color: "#ffffff",
              }}
            >
              Stock Movements
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#d0d9e8",
                lineHeight: 1.6,
              }}
            >
              Monitor and track inventory transactions across departments.
            </p>
          </div>

          <div
            style={{
              padding: "15px 20px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              minWidth: "145px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#aebbd1",
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              TRANSACTION RECORDS
            </div>

            <div
              style={{
                fontSize: "25px",
                fontWeight: 800,
                color: "#ffffff",
                marginTop: "5px",
              }}
            >
              {totalMovements}
            </div>
          </div>
        </div>

        {/* =====================================
            SUMMARY CARDS
        ===================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "16px",
          }}
        >
          {[
            {
              label: "Total Movements",
              value: totalMovements,
              description: "Recorded transactions",
              color: "#315db5",
              background: "#eff4ff",
              symbol: "↔",
            },
            {
              label: "Stock Received",
              value: receivedCount || 0,
              description: "Incoming transactions",
              color: "#087f5b",
              background: "#eaf8f0",
              symbol: "↓",
            },
            {
              label: "Stock Issued",
              value: issuedCount || 0,
              description: "Outgoing transactions",
              color: "#b96b12",
              background: "#fff5e9",
              symbol: "↑",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "21px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "13px",
                boxShadow: "0 3px 12px rgba(15,23,42,0.03)",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: stat.background,
                  color: stat.color,
                  fontSize: "23px",
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {stat.symbol}
              </div>

              <div>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: 700,
                    marginBottom: "5px",
                  }}
                >
                  {stat.label}
                </div>

                <div
                  style={{
                    color: "#17213c",
                    fontSize: "23px",
                    fontWeight: 800,
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </div>

                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "10px",
                    marginTop: "4px",
                  }}
                >
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* =====================================
            TRANSACTION HISTORY
        ===================================== */}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 4px 15px rgba(15,23,42,0.035)",
          }}
        >

          {/* SECTION HEADER */}

          <div
            style={{
              padding: "22px 24px",
              borderBottom: "1px solid #edf1f5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#17213c",
                  fontSize: "16px",
                  fontWeight: 800,
                }}
              >
                Transaction History
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#94a3b8",
                  fontSize: "11px",
                }}
              >
                Complete record of inventory receipts, issues and transfers.
              </p>
            </div>

            <span
              style={{
                padding: "6px 11px",
                background: "#f1f5f9",
                borderRadius: "7px",
                color: "#475569",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              {totalMovements} Records
            </span>
          </div>

          {/* SEARCH AND FILTER AREA */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              padding: "18px 24px",
              background: "#fbfcfd",
              borderBottom: "1px solid #edf1f5",
            }}
          >
            <input
              placeholder="Search reference or item..."
              style={{
                flex: "1 1 240px",
                minWidth: 0,
                height: "42px",
                padding: "0 14px",
                border: "1px solid #dfe6ee",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#334155",
                fontSize: "12px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <select
              style={{
                flex: "0 1 210px",
                height: "42px",
                padding: "0 12px",
                border: "1px solid #dfe6ee",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#475569",
                fontSize: "12px",
                boxSizing: "border-box",
              }}
            >
              <option>All Movement Types</option>
              <option>Receive</option>
              <option>Issue</option>
              <option>Transfer</option>
              <option>Return</option>
              <option>Adjustment</option>
            </select>
          </div>

          {/* =====================================
              MOVEMENT TABLE
          ===================================== */}

          {records.length > 0 ? (
            <div
              style={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  minWidth: "900px",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {[
                      "REFERENCE",
                      "DATE",
                      "ITEM DETAILS",
                      "SOURCE",
                      "DESTINATION",
                      "QUANTITY",
                      "MOVEMENT TYPE",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: "14px 16px",
                          color: "#64748b",
                          fontSize: "10px",
                          fontWeight: 800,
                          letterSpacing: "0.6px",
                          borderBottom: "1px solid #e5eaf0",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {records.map((movement) => {
                    const fromDepartment = Array.isArray(
                      movement.from_department
                    )
                      ? movement.from_department[0]
                      : movement.from_department;

                    const toDepartment = Array.isArray(
                      movement.to_department
                    )
                      ? movement.to_department[0]
                      : movement.to_department;

                    const item = Array.isArray(movement.item)
                      ? movement.item[0]
                      : movement.item;

                    const unit = Array.isArray(
                      item?.units_of_measure
                    )
                      ? item.units_of_measure[0]
                      : item?.units_of_measure;

                    const supplier =
                      movement.movement_type === "Receive" &&
                      movement.reference_number
                        ? supplierMap[movement.reference_number]
                        : null;

                    const badgeStyle = getMovementStyle(
                      movement.movement_type
                    );

                    return (
                      <tr
                        key={movement.id}
                        style={{
                          borderBottom: "1px solid #f0f3f6",
                        }}
                      >
                        {/* REFERENCE */}

                        <td
                          style={{
                            padding: "16px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              color: "#315db5",
                              fontSize: "11px",
                              fontWeight: 800,
                            }}
                          >
                            {movement.reference_number || "—"}
                          </span>
                        </td>

                        {/* DATE */}

                        <td
                          style={{
                            padding: "16px",
                            color: "#64748b",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {new Date(
                            movement.created_at
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* ITEM */}

                        <td
                          style={{
                            padding: "16px",
                            minWidth: "155px",
                          }}
                        >
                          <div
                            style={{
                              color: "#17213c",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            {item?.name || "—"}
                          </div>

                          <div
                            style={{
                              color: "#94a3b8",
                              fontSize: "10px",
                              marginTop: "4px",
                            }}
                          >
                            {item?.item_code || "No item code"}
                          </div>
                        </td>

                        {/* SOURCE */}

                        <td
                          style={{
                            padding: "16px",
                            color: "#475569",
                            fontSize: "11px",
                            minWidth: "120px",
                          }}
                        >
                          {supplier || fromDepartment?.name || "—"}
                        </td>

                        {/* DESTINATION */}

                        <td
                          style={{
                            padding: "16px",
                            color: "#475569",
                            fontSize: "11px",
                            minWidth: "120px",
                          }}
                        >
                          {toDepartment?.name || "—"}
                        </td>

                        {/* QUANTITY */}

                        <td
                          style={{
                            padding: "16px",
                            color: "#17213c",
                            fontSize: "12px",
                            fontWeight: 800,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {movement.quantity}{" "}
                          <span
                            style={{
                              color: "#64748b",
                              fontSize: "10px",
                              fontWeight: 500,
                            }}
                          >
                            {unit?.abbreviation || ""}
                          </span>
                        </td>

                        {/* MOVEMENT TYPE */}

                        <td style={{ padding: "16px" }}>
                          <span
                            style={{
                              ...badgeStyle,
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              fontSize: "10px",
                              fontWeight: 800,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {movement.movement_type}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{
                padding: "65px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background: "#f1f5f9",
                  color: "#64748b",
                  fontSize: "23px",
                }}
              >
                ↔
              </div>

              <h3
                style={{
                  color: "#17213c",
                  fontSize: "15px",
                  margin: "0 0 7px",
                }}
              >
                No stock movements
              </h3>

              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "12px",
                  margin: 0,
                }}
              >
                There are currently no stock movements recorded in the system.
              </p>
            </div>
          )}

          {/* =====================================
              PAGINATION FOOTER
          ===================================== */}

          <div
            style={{
              padding: "16px 22px",
              background: "#fbfcfd",
              borderTop: "1px solid #edf1f5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <span
              style={{
                color: "#64748b",
                fontSize: "11px",
              }}
            >
              Showing{" "}
              {totalMovements === 0 ? 0 : from + 1}
              {"–"}
              {Math.min(from + records.length, totalMovements)}
              {" "}of {totalMovements} movements
            </span>

            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                {/* PREVIOUS BUTTON */}

                {currentPage > 1 ? (
                  <Link
                    href={`/movements?page=${currentPage - 1}`}
                    style={paginationButton}
                  >
                    Previous
                  </Link>
                ) : (
                  <span
                    style={{
                      ...paginationButton,
                      opacity: 0.4,
                      cursor: "not-allowed",
                    }}
                  >
                    Previous
                  </span>
                )}

                {/* PAGE NUMBERS */}

                {Array.from(
                  new Set([
                    1,
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    totalPages,
                  ])
                )
                  .filter(
                    (page) =>
                      page >= 1 && page <= totalPages
                  )
                  .sort((a, b) => a - b)
                  .map((page, index, pages) => (
                    <span
                      key={page}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {index > 0 &&
                        page - pages[index - 1] > 1 && (
                          <span
                            style={{
                              color: "#94a3b8",
                              padding: "0 3px",
                            }}
                          >
                            ...
                          </span>
                        )}

                      <Link
                        href={`/movements?page=${page}`}
                        style={{
                          ...paginationButton,
                          background:
                            currentPage === page
                              ? "#087f5b"
                              : "#ffffff",
                          color:
                            currentPage === page
                              ? "#ffffff"
                              : "#475569",
                          borderColor:
                            currentPage === page
                              ? "#087f5b"
                              : "#dfe6ee",
                          fontWeight:
                            currentPage === page ? 800 : 600,
                        }}
                      >
                        {page}
                      </Link>
                    </span>
                  ))}

                {/* NEXT BUTTON */}

                {currentPage < totalPages ? (
                  <Link
                    href={`/movements?page=${currentPage + 1}`}
                    style={paginationButton}
                  >
                    Next
                  </Link>
                ) : (
                  <span
                    style={{
                      ...paginationButton,
                      opacity: 0.4,
                      cursor: "not-allowed",
                    }}
                  >
                    Next
                  </span>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </Page>
  );
}
