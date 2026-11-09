
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  PackageCheck,
  ShoppingCart,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { Page } from "@/components/Page";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 10;

type PurchaseOrder = {
  id: string;
  po_number: string;
  supplier: string | null;
  status: string;
  total_amount: number | null;
  purchase_order_items: {
    quantity: number;
    inventory_items:
      | { name: string; item_code: string | null }
      | { name: string; item_code: string | null }[]
      | null;
    units_of_measure:
      | { abbreviation: string }
      | { abbreviation: string }[]
      | null;
  }[] | null;
};

function getRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function getStatusStyle(status: string) {
  const styles: Record<string, React.CSSProperties> = {
    "Pending Approval": {
      background: "#fff7ed",
      color: "#c2410c",
      border: "1px solid #fed7aa",
    },
    Approved: {
      background: "#eff6ff",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe",
    },
    Ordered: {
      background: "#f5f3ff",
      color: "#6d28d9",
      border: "1px solid #ddd6fe",
    },
    "Partially Received": {
      background: "#fffbeb",
      color: "#a16207",
      border: "1px solid #fde68a",
    },
    Received: {
      background: "#ecfdf5",
      color: "#047857",
      border: "1px solid #a7f3d0",
    },
    Declined: {
      background: "#fef2f2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    },
    Cancelled: {
      background: "#f1f5f9",
      color: "#475569",
      border: "1px solid #cbd5e1",
    },
  };

  return styles[status] ?? {
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
  };
}

function SummaryCard({
  title,
  value,
  icon,
  color,
  background,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  background: string;
}) {
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e8edf2",
      borderRadius: "12px",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
    }}>
      <div>
        <p style={{
          margin: 0,
          color: "#64748b",
          fontSize: "13px",
          fontWeight: 500,
        }}>{title}</p>
        <h2 style={{
          margin: "8px 0 0",
          color: "#172b4d",
          fontSize: "27px",
          fontWeight: 700,
        }}>{value}</h2>
      </div>

      <div style={{
        width: "44px",
        height: "44px",
        borderRadius: "11px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        background,
        flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  padding: "16px",
  borderBottom: "1px solid #edf0f4",
  color: "#475569",
  fontSize: "12px",
  verticalAlign: "middle",
};

export default async function POs({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;

  const search = params.search?.trim() ?? "";
  const statusFilter = params.status ?? "";

  // Retrieve purchase orders and their item details.
  const { data, error } = await supabase
    .from("purchase_orders")
    .select(`
      id,
      po_number,
      supplier,
      status,
      total_amount,
      purchase_order_items (
        quantity,
        inventory_items (
          name,
          item_code
        ),
        units_of_measure:unit_id (
          abbreviation
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Page title="Purchase Orders">
        <div style={{
          padding: "24px",
          background: "#ffffff",
          border: "1px solid #fecaca",
          borderRadius: "12px",
        }}>
          <h2 style={{ color: "#991b1b" }}>
            Unable to load Purchase Orders
          </h2>
          <p style={{ color: "#64748b" }}>{error.message}</p>
        </div>
      </Page>
    );
  }

  const purchaseOrders = (data ?? []) as unknown as PurchaseOrder[];

  // Summary figures are calculated across all purchase orders.
  const totalCount = purchaseOrders.length;

  const pendingCount = purchaseOrders.filter(
    po => po.status === "Pending Approval"
  ).length;

  const approvedCount = purchaseOrders.filter(
    po => po.status === "Approved"
  ).length;

  const orderedCount = purchaseOrders.filter(
    po => po.status === "Ordered"
  ).length;

  const receivedCount = purchaseOrders.filter(
    po => po.status === "Received"
  ).length;

  // Apply search and status filters.
  const filteredOrders = purchaseOrders.filter(po => {
    const firstItem = po.purchase_order_items?.[0];
    const item = getRelation(firstItem?.inventory_items);

    const searchText = search.toLowerCase();

    const matchesSearch =
      !search ||
      po.po_number?.toLowerCase().includes(searchText) ||
      po.supplier?.toLowerCase().includes(searchText) ||
      item?.name?.toLowerCase().includes(searchText) ||
      item?.item_code?.toLowerCase().includes(searchText);

    const matchesStatus =
      !statusFilter || po.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination.
  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / PAGE_SIZE)
  );

  const requestedPage = Number(params.page || "1");

  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(1, Math.floor(requestedPage)), totalPages)
    : 1;

  const from = (currentPage - 1) * PAGE_SIZE;

  const paginatedOrders = filteredOrders.slice(
    from,
    from + PAGE_SIZE
  );

  function pageUrl(page: number) {
    const query = new URLSearchParams();

    if (search) query.set("search", search);
    if (statusFilter) query.set("status", statusFilter);

    query.set("page", String(page));

    return `/purchase-orders?${query.toString()}`;
  }

  const inputStyle: React.CSSProperties = {
    height: "42px",
    border: "1px solid #dce3eb",
    borderRadius: "8px",
    padding: "0 12px",
    fontSize: "13px",
    color: "#334155",
    background: "#ffffff",
    minWidth: 0,
    outline: "none",
  };

  const paginationStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "35px",
    height: "35px",
    padding: "0 9px",
    borderRadius: "7px",
    border: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "12px",
    textDecoration: "none",
  };

  return (
    <Page title="Purchase Orders">
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}>

        {/* PAGE HEADER */}
        <div style={{
          background: "#172b4d",
          borderRadius: "14px",
          padding: "26px 28px",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}>
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              marginBottom: "9px",
              color: "#a7c7b5",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.7px",
              textTransform: "uppercase",
            }}>
              <ShoppingCart size={16} />
              Procurement Management
            </div>

            <h1 style={{
              margin: 0,
              fontSize: "25px",
              fontWeight: 700,
              color: "#ffffff",
            }}>
              Purchase Orders
            </h1>

            <p style={{
              margin: "8px 0 0",
              color: "#cbd5e1",
              fontSize: "13px",
            }}>
              Manage supplier orders, monitor approvals and track goods received.
            </p>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            color: "#d1fae5",
            fontSize: "12px",
            background: "rgba(255,255,255,0.09)",
            padding: "10px 14px",
            borderRadius: "8px",
          }}>
            <ClipboardList size={15} />
            Procurement Overview
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
          gap: "14px",
        }}>
          <SummaryCard
            title="Total Purchase Orders"
            value={totalCount}
            icon={<ClipboardList size={21} />}
            color="#2563eb"
            background="#eff6ff"
          />

          <SummaryCard
            title="Pending Approval"
            value={pendingCount}
            icon={<Clock size={21} />}
            color="#d97706"
            background="#fff7ed"
          />

          <SummaryCard
            title="Approved"
            value={approvedCount}
            icon={<CheckCircle2 size={21} />}
            color="#2563eb"
            background="#eff6ff"
          />

          <SummaryCard
            title="Ordered"
            value={orderedCount}
            icon={<ShoppingCart size={21} />}
            color="#7c3aed"
            background="#f5f3ff"
          />

          <SummaryCard
            title="Received"
            value={receivedCount}
            icon={<PackageCheck size={21} />}
            color="#059669"
            background="#ecfdf5"
          />
        </div>

        {/* PURCHASE ORDER REGISTER */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e8edf2",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
        }}>
          <div style={{
            padding: "21px 22px",
            borderBottom: "1px solid #edf0f4",
          }}>
            <h2 style={{
              margin: 0,
              color: "#172b4d",
              fontSize: "17px",
              fontWeight: 700,
            }}>
              Purchase Order Register
            </h2>

            <p style={{
              margin: "6px 0 0",
              color: "#64748b",
              fontSize: "12px",
            }}>
              Review supplier orders and monitor their progress.
            </p>

            {/* SEARCH AND FILTERS */}
            <form
              action="/purchase-orders"
              method="GET"
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "18px",
                flexWrap: "wrap",
              }}
            >
              <div style={{
                position: "relative",
                flex: "1 1 250px",
                minWidth: 0,
              }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "13px",
                    color: "#94a3b8",
                  }}
                />

                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search PO number, supplier or item..."
                  style={{
                    ...inputStyle,
                    width: "100%",
                    paddingLeft: "36px",
                  }}
                />
              </div>

              <select
                name="status"
                defaultValue={statusFilter}
                style={{ ...inputStyle, flex: "1 1 160px" }}
              >
                <option value="">All statuses</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Ordered">Ordered</option>
                <option value="Partially Received">Partially Received</option>
                <option value="Received">Received</option>
                <option value="Declined">Declined</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button
                type="submit"
                style={{
                  height: "42px",
                  padding: "0 19px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#176b45",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Apply Filters
              </button>

              <Link
                href="/purchase-orders"
                style={{
                  height: "42px",
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 14px",
                  border: "1px solid #dce3eb",
                  borderRadius: "8px",
                  color: "#475569",
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                Clear
              </Link>
            </form>
          </div>

          {/* TABLE */}
          {paginatedOrders.length > 0 ? (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  minWidth: "950px",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {[
                        "PURCHASE ORDER",
                        "SUPPLIER",
                        "ITEM",
                        "QUANTITY",
                        "TOTAL AMOUNT",
                        "STATUS",
                        "ACTION",
                      ].map(heading => (
                        <th key={heading} style={{
                          padding: "14px 16px",
                          color: "#64748b",
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.6px",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #e8edf2",
                        }}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedOrders.map(po => {
                      const firstItem = po.purchase_order_items?.[0];

                      const item = getRelation(
                        firstItem?.inventory_items
                      );

                      const unit = getRelation(
                        firstItem?.units_of_measure
                      );

                      return (
                        <tr key={po.id}>
                          <td style={cellStyle}>
                            <strong style={{
                              color: "#172b4d",
                              fontSize: "12px",
                            }}>
                              {po.po_number}
                            </strong>

                            <small style={{
                              display: "block",
                              color: "#94a3b8",
                              marginTop: "4px",
                            }}>
                              Purchase Order
                            </small>
                          </td>

                          <td style={cellStyle}>
                            <span style={{
                              color: "#334155",
                              fontWeight: 600,
                            }}>
                              {po.supplier || "Not specified"}
                            </span>
                          </td>

                          <td style={cellStyle}>
                            <div style={{
                              color: "#334155",
                              fontWeight: 600,
                            }}>
                              {item?.name || "Unknown item"}
                            </div>

                            <small style={{
                              display: "block",
                              color: "#94a3b8",
                              marginTop: "4px",
                            }}>
                              {item?.item_code || "No item code"}
                            </small>

                            {(po.purchase_order_items?.length ?? 0) > 1 && (
                              <small style={{
                                display: "block",
                                color: "#176b45",
                                marginTop: "4px",
                                fontWeight: 600,
                              }}>
                                +{po.purchase_order_items!.length - 1} more item(s)
                              </small>
                            )}
                          </td>

                          <td style={cellStyle}>
                            <strong style={{ color: "#172b4d" }}>
                              {firstItem?.quantity ?? 0}
                            </strong>{" "}
                            <span style={{ color: "#64748b" }}>
                              {unit?.abbreviation || ""}
                            </span>
                          </td>

                          <td style={cellStyle}>
                            <strong style={{
                              color: "#172b4d",
                              whiteSpace: "nowrap",
                            }}>
                              M{Number(po.total_amount || 0).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </strong>
                          </td>

                          <td style={cellStyle}>
                            <span style={{
                              ...getStatusStyle(po.status),
                              display: "inline-block",
                              padding: "5px 9px",
                              borderRadius: "20px",
                              fontSize: "10px",
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}>
                              {po.status}
                            </span>
                          </td>

                          <td style={cellStyle}>
                            <Link
                              href={`/purchase-orders/${po.id}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 11px",
                                borderRadius: "7px",
                                background: "#eff6ff",
                                color: "#1d4ed8",
                                textDecoration: "none",
                                fontSize: "11px",
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                              }}
                            >
                              <Eye size={14} />
                              Review
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div style={{
                padding: "15px 20px",
                borderTop: "1px solid #edf0f4",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}>
                <p style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "12px",
                }}>
                  Showing {from + 1}–{Math.min(
                    from + PAGE_SIZE,
                    filteredOrders.length
                  )} of {filteredOrders.length} purchase orders
                </p>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}>
                  <Link
                    href={pageUrl(Math.max(1, currentPage - 1))}
                    aria-disabled={currentPage === 1}
                    style={{
                      ...paginationStyle,
                      opacity: currentPage === 1 ? 0.4 : 1,
                      pointerEvents: currentPage === 1 ? "none" : "auto",
                    }}
                  >
                    <ChevronLeft size={16} />
                  </Link>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  )
                    .filter(page =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    )
                    .map((page, index, pages) => (
                      <span key={page} style={{ display: "contents" }}>
                        {index > 0 && pages[index - 1] !== page - 1 && (
                          <span style={{
                            color: "#94a3b8",
                            padding: "0 3px",
                          }}>
                            …
                          </span>
                        )}

                        <Link
                          href={pageUrl(page)}
                          style={{
                            ...paginationStyle,
                            background: currentPage === page
                              ? "#176b45"
                              : "#ffffff",
                            color: currentPage === page
                              ? "#ffffff"
                              : "#475569",
                            borderColor: currentPage === page
                              ? "#176b45"
                              : "#e2e8f0",
                            fontWeight: currentPage === page ? 700 : 500,
                          }}
                        >
                          {page}
                        </Link>
                      </span>
                    ))}

                  <Link
                    href={pageUrl(Math.min(totalPages, currentPage + 1))}
                    aria-disabled={currentPage === totalPages}
                    style={{
                      ...paginationStyle,
                      opacity: currentPage === totalPages ? 0.4 : 1,
                      pointerEvents: currentPage === totalPages ? "none" : "auto",
                    }}
                  >
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              padding: "55px 20px",
              textAlign: "center",
            }}>
              <div style={{
                width: "58px",
                height: "58px",
                margin: "0 auto 15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "15px",
                background: "#f1f5f9",
                color: "#64748b",
              }}>
                {purchaseOrders.length === 0
                  ? <ClipboardList size={27} />
                  : <Search size={27} />}
              </div>

              <h3 style={{
                color: "#172b4d",
                fontSize: "16px",
                margin: "0 0 7px",
              }}>
                {purchaseOrders.length === 0
                  ? "No purchase orders yet"
                  : "No matching purchase orders"}
              </h3>

              <p style={{
                color: "#64748b",
                fontSize: "13px",
                margin: 0,
              }}>
                {purchaseOrders.length === 0
                  ? "Purchase orders created from stock request reviews will appear here."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
