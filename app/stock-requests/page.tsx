
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Page } from "@/components/Page";

const PAGE_SIZE = 10;

type Request = {
  id: string;
  request_number: string;
  quantity_requested: number;
  quantity_issued: number | null;
  status: string;
  priority: string;
  reason: string | null;
  notes: string | null;
  requested_at: string;
  processed_at: string | null;
  departments: { name: string } | { name: string }[] | null;
  inventory_items:
    | { name: string; item_code: string | null }
    | { name: string; item_code: string | null }[]
    | null;
  units_of_measure:
    | { name: string; abbreviation: string }
    | { name: string; abbreviation: string }[]
    | null;
};

function getRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function getStatusStyle(status: string) {
  const styles: Record<string, React.CSSProperties> = {
    Pending: {
      background: "#fff7ed",
      color: "#c2410c",
      border: "1px solid #fed7aa",
    },
    Approved: {
      background: "#eff6ff",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe",
    },
    "Partially Issued": {
      background: "#f5f3ff",
      color: "#6d28d9",
      border: "1px solid #ddd6fe",
    },
    Issued: {
      background: "#ecfdf5",
      color: "#047857",
      border: "1px solid #a7f3d0",
    },
    Rejected: {
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

function getPriorityStyle(priority: string) {
  const styles: Record<string, React.CSSProperties> = {
    Critical: { color: "#b91c1c", background: "#fef2f2" },
    High: { color: "#c2410c", background: "#fff7ed" },
    Normal: { color: "#475569", background: "#f1f5f9" },
    Low: { color: "#047857", background: "#ecfdf5" },
  };

  return styles[priority] ?? styles.Normal;
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
      minWidth: 0,
      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
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

export default async function StockRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    priority?: string;
  }>;
}) {
  const params = await searchParams;

  const search = params.search?.trim() ?? "";
  const statusFilter = params.status ?? "";
  const priorityFilter = params.priority ?? "";

  const { data, error } = await supabase
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
      departments:requesting_department_id (name),
      inventory_items:requested_item_id (name, item_code),
      units_of_measure:unit_id (name, abbreviation)
    `)
    .order("requested_at", { ascending: false });

  if (error) {
    return (
      <Page title="Stock Requests">
        <div style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid #fecaca",
        }}>
          <h2 style={{ color: "#991b1b" }}>Unable to load stock requests</h2>
          <p style={{ color: "#64748b" }}>{error.message}</p>
        </div>
      </Page>
    );
  }

  const requests = (data ?? []) as unknown as Request[];

  const pendingCount = requests.filter(r => r.status === "Pending").length;
  const approvedCount = requests.filter(r => r.status === "Approved").length;
  const issuedCount = requests.filter(
    r => r.status === "Issued" || r.status === "Partially Issued"
  ).length;
  const rejectedCount = requests.filter(r => r.status === "Rejected").length;

  const filteredRequests = requests.filter(request => {
    const department = getRelation(request.departments);
    const item = getRelation(request.inventory_items);

    const searchMatch =
      !search ||
      request.request_number?.toLowerCase().includes(search.toLowerCase()) ||
      department?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item?.item_code?.toLowerCase().includes(search.toLowerCase());

    const statusMatch = !statusFilter || request.status === statusFilter;
    const priorityMatch = !priorityFilter || request.priority === priorityFilter;

    return searchMatch && statusMatch && priorityMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const requestedPage = Number(params.page ?? "1");
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(1, Math.floor(requestedPage)), totalPages)
    : 1;

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  function pageUrl(page: number) {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (statusFilter) query.set("status", statusFilter);
    if (priorityFilter) query.set("priority", priorityFilter);
    query.set("page", String(page));
    return `/stock-requests?${query.toString()}`;
  }

  const inputStyle: React.CSSProperties = {
    height: "42px",
    border: "1px solid #dce3eb",
    borderRadius: "8px",
    padding: "0 12px",
    fontSize: "13px",
    color: "#334155",
    background: "#ffffff",
    outline: "none",
    minWidth: 0,
  };

  const paginationStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "34px",
    height: "34px",
    padding: "0 9px",
    borderRadius: "7px",
    border: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "13px",
    textDecoration: "none",
  };

  return (
    <Page title="Stock Requests">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

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
              <ClipboardList size={16} />
              Inventory Management
            </div>
            <h1 style={{
              margin: 0,
              fontSize: "25px",
              fontWeight: 700,
              color: "#ffffff",
            }}>Stock Requests</h1>
            <p style={{
              margin: "8px 0 0",
              color: "#cbd5e1",
              fontSize: "13px",
            }}>
              Monitor, review and manage stock requests submitted by departments.
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
            <Clock size={15} />
            Request Overview
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "14px",
        }}>
          <SummaryCard
            title="Total Requests"
            value={requests.length}
            icon={<ClipboardList size={21} />}
            color="#2563eb"
            background="#eff6ff"
          />
          <SummaryCard
            title="Pending Review"
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
            title="Issued"
            value={issuedCount}
            icon={<PackageCheck size={21} />}
            color="#059669"
            background="#ecfdf5"
          />
          <SummaryCard
            title="Rejected"
            value={rejectedCount}
            icon={<XCircle size={21} />}
            color="#dc2626"
            background="#fef2f2"
          />
        </div>

        {/* REQUEST REGISTER */}
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
            }}>Request Register</h2>
            <p style={{
              margin: "6px 0 0",
              color: "#64748b",
              fontSize: "12px",
            }}>
              View and review department stock requests.
            </p>

            {/* FILTERS */}
            <form
              action="/stock-requests"
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
                flex: "1 1 240px",
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
                  placeholder="Search request, department or item..."
                  style={{ ...inputStyle, width: "100%", paddingLeft: "36px" }}
                />
              </div>

              <select
                name="status"
                defaultValue={statusFilter}
                style={{ ...inputStyle, flex: "1 1 145px" }}
              >
                <option value="">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Partially Issued">Partially Issued</option>
                <option value="Issued">Issued</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                name="priority"
                defaultValue={priorityFilter}
                style={{ ...inputStyle, flex: "1 1 130px" }}
              >
                <option value="">All priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
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
                href="/stock-requests"
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
          {paginatedRequests.length > 0 ? (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "950px",
                  textAlign: "left",
                }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {[
                        "REQUEST",
                        "DEPARTMENT",
                        "ITEM",
                        "QUANTITY",
                        "PRIORITY",
                        "STATUS",
                        "REQUESTED",
                        "ACTION",
                      ].map((heading) => (
                        <th key={heading} style={{
                          padding: "14px 16px",
                          color: "#64748b",
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.6px",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #e8edf2",
                        }}>{heading}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedRequests.map((request) => {
                      const department = getRelation(request.departments);
                      const item = getRelation(request.inventory_items);
                      const unit = getRelation(request.units_of_measure);

                      return (
                        <tr key={request.id}>
                          <td style={cellStyle}>
                            <strong style={{
                              color: "#172b4d",
                              fontSize: "12px",
                            }}>{request.request_number}</strong>
                          </td>

                          <td style={cellStyle}>
                            <span style={{ color: "#334155", fontWeight: 500 }}>
                              {department?.name || "—"}
                            </span>
                          </td>

                          <td style={cellStyle}>
                            <div style={{ color: "#334155", fontWeight: 600 }}>
                              {item?.name || "—"}
                            </div>
                            {item?.item_code && (
                              <small style={{
                                display: "block",
                                color: "#94a3b8",
                                marginTop: "4px",
                              }}>{item.item_code}</small>
                            )}
                          </td>

                          <td style={cellStyle}>
                            <strong style={{ color: "#172b4d" }}>
                              {request.quantity_requested}
                            </strong>{" "}
                            <span style={{ color: "#64748b" }}>
                              {unit?.abbreviation || ""}
                            </span>
                            {(request.quantity_issued ?? 0) > 0 && (
                              <small style={{
                                display: "block",
                                marginTop: "4px",
                                color: "#059669",
                              }}>
                                {request.quantity_issued} issued
                              </small>
                            )}
                          </td>

                          <td style={cellStyle}>
                            <span style={{
                              ...getPriorityStyle(request.priority),
                              padding: "5px 9px",
                              borderRadius: "20px",
                              fontSize: "10px",
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}>
                              {request.priority || "Normal"}
                            </span>
                          </td>

                          <td style={cellStyle}>
                            <span style={{
                              ...getStatusStyle(request.status),
                              display: "inline-block",
                              padding: "5px 9px",
                              borderRadius: "20px",
                              fontSize: "10px",
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}>
                              {request.status}
                            </span>
                          </td>

                          <td style={{
                            ...cellStyle,
                            color: "#64748b",
                            whiteSpace: "nowrap",
                          }}>
                            {new Date(request.requested_at).toLocaleDateString()}
                          </td>

                          <td style={cellStyle}>
                            <Link
                              href={`/stock-requests/${request.id}`}
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
                  Showing {startIndex + 1}–{Math.min(
                    startIndex + PAGE_SIZE,
                    filteredRequests.length
                  )} of {filteredRequests.length} requests
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

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
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
                            fontSize: "12px",
                          }}>…</span>
                        )}
                        <Link
                          href={pageUrl(page)}
                          style={{
                            ...paginationStyle,
                            background: currentPage === page ? "#176b45" : "#ffffff",
                            color: currentPage === page ? "#ffffff" : "#475569",
                            borderColor: currentPage === page ? "#176b45" : "#e2e8f0",
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
                {filteredRequests.length === 0 && requests.length > 0
                  ? <AlertCircle size={27} />
                  : <ClipboardList size={27} />}
              </div>
              <h3 style={{
                color: "#172b4d",
                fontSize: "16px",
                margin: "0 0 7px",
              }}>
                {requests.length === 0
                  ? "No stock requests yet"
                  : "No matching requests"}
              </h3>
              <p style={{
                color: "#64748b",
                fontSize: "13px",
                margin: 0,
              }}>
                {requests.length === 0
                  ? "Department stock requests will appear here when submitted."
                  : "Try changing your search or filter criteria."}
              </p>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}

const cellStyle: React.CSSProperties = {
  padding: "15px 16px",
  borderBottom: "1px solid #edf0f4",
  color: "#475569",
  fontSize: "12px",
  verticalAlign: "middle",
};
