import { Page } from "@/components/Page";
import { supabase } from "@/lib/supabase";
import LiveClock from "@/components/LiveClock";
import InventoryValueChart from "@/components/dashboard/InventoryValueChart";
import StockMovementChart from "@/components/dashboard/StockMovementChart";
import StockHealthChart from "@/components/dashboard/StockHealthChart";
import DepartmentQuantityChart from "@/components/dashboard/DepartmentQuantityChart";

import {
  Package,
  Wallet,
  AlertTriangle,
  ArrowLeftRight,
  CalendarDays,
} from "lucide-react";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Dashboard() {
  /* =========================
     DATE RANGE
  ========================= */

  const today = new Date();

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const movementStartDate =
    sevenDaysAgo.toISOString();

  /* =========================
     LOAD INVENTORY
  ========================= */

  const {
    data: inventory,
    error: inventoryError,
  } = await supabase
    .from("inventory_items")
    .select(`
      id,
      name,
      item_code,
      department_id,
      quantity,
      unit_cost,
      minimum_level,
      reorder_level,
      units_of_measure (
        abbreviation
      )
    `)
    .eq("is_active", true)
    .order("name");

  /* =========================
     LOAD DEPARTMENTS
  ========================= */

  const {
    data: departments,
    error: departmentsError,
  } = await supabase
    .from("departments")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  /* =========================
     LOAD ALL MOVEMENTS
     FOR THE LAST 7 DAYS
  ========================= */

  const {
    data: movementHistory,
    error: movementHistoryError,
  } = await supabase
    .from("stock_movements")
    .select(`
      id,
      quantity,
      movement_type,
      reference_number,
      created_at
    `)
    .gte("created_at", movementStartDate)
    .order("created_at", {
      ascending: true,
    });

  /* =========================
     LOAD RECENT MOVEMENTS
     FOR TABLE
  ========================= */

  const {
    data: recentMovements,
    error: recentMovementsError,
  } = await supabase
    .from("stock_movements")
    .select(`
      id,
      quantity,
      movement_type,
      reference_number,
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
    .order("created_at", {
      ascending: false,
    })
    .limit(10);

  /* =========================
     ERROR HANDLING
  ========================= */

  if (
    inventoryError ||
    departmentsError ||
    movementHistoryError ||
    recentMovementsError
  ) {
    return (
      <Page title="Dashboard">
        <div className="card">
          <h2>
            Unable to load dashboard
          </h2>

          <p>
            {inventoryError?.message ||
              departmentsError?.message ||
              movementHistoryError?.message ||
              recentMovementsError?.message ||
              "An unexpected error occurred."}
          </p>
        </div>
      </Page>
    );
  }

  /* =========================
     INVENTORY
  ========================= */

  const inventoryItems =
    inventory ?? [];

  /* =========================
     STOCK STATUS
  ========================= */

  const lowStock =
    inventoryItems.filter(
      (item) =>
        item.quantity >
          item.minimum_level &&
        item.quantity <=
          item.reorder_level
    );

  const criticalStock =
    inventoryItems.filter(
      (item) =>
        item.quantity <=
        item.minimum_level
    );

  const lowOrCritical = [
    ...lowStock,
    ...criticalStock,
  ];

  const goodStockCount =
  inventoryItems.filter(
    (item) =>
      item.quantity >
      item.reorder_level
  ).length;

const stockHealth = [
  {
    name: "Good",
    value: goodStockCount,
  },
  {
    name: "Low",
    value: lowStock.length,
  },
  {
    name: "Critical",
    value: criticalStock.length,
  },
];

  /* =========================
     TOTAL INVENTORY VALUE
  ========================= */

  const totalInventoryCost =
    inventoryItems.reduce(
      (total, item) => {
        return (
          total +
          Number(item.quantity) *
            Number(item.unit_cost)
        );
      },
      0
    );

  /* =========================
     INVENTORY VALUE
     BY DEPARTMENT
  ========================= */

  const departmentValues =
    (departments ?? []).map(
      (department) => {
        const departmentItems =
          inventoryItems.filter(
            (item) =>
              item.department_id ===
              department.id
          );

        const value =
          departmentItems.reduce(
            (total, item) =>
              total +
              Number(item.quantity) *
                Number(item.unit_cost),
            0
          );

        return {
          name: department.name,
          value,
        };
      }
    );



    /* =========================
   INVENTORY QUANTITY
   BY DEPARTMENT
========================= */

const departmentQuantities =
  (departments ?? []).map(
    (department) => {
      const departmentItems =
        inventoryItems.filter(
          (item) =>
            item.department_id ===
            department.id
        );

      return {
        name: department.name,
        quantity: departmentItems.length,
      };
    }
  );


  /* =========================
     7-DAY MOVEMENT TREND
  ========================= */

  const movementTrend =
    Array.from(
      { length: 7 },
      (_, index) => {
        const date =
          new Date(sevenDaysAgo);

        date.setDate(
          sevenDaysAgo.getDate() +
            index
        );

        const year =
          date.getFullYear();

        const month =
          String(
            date.getMonth() + 1
          ).padStart(2, "0");

        const day =
          String(
            date.getDate()
          ).padStart(2, "0");

        const dateKey =
          `${year}-${month}-${day}`;

        const quantity =
          (movementHistory ?? [])
            .filter((movement) => {
              const movementDate =
                new Date(
                  movement.created_at
                );

              const movementYear =
                movementDate.getFullYear();

              const movementMonth =
                String(
                  movementDate.getMonth() + 1
                ).padStart(2, "0");

              const movementDay =
                String(
                  movementDate.getDate()
                ).padStart(2, "0");

              const movementDateKey =
                `${movementYear}-${movementMonth}-${movementDay}`;

              return (
                movementDateKey ===
                dateKey
              );
            })
            .reduce(
              (total, movement) =>
                total +
                Number(
                  movement.quantity
                ),
              0
            );

        return {
          date: date.toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "short",
            }
          ),
          quantity,
        };
      }
    );

  /* =========================
     DASHBOARD
  ========================= */

  return (
    <Page title="Dashboard">



{/* =========================
    PAGE HEADER
========================= */}

<div className="dashboard-hero">

  <div className="dashboard-hero-content">

    <div className="dashboard-eyebrow">
      <span className="dashboard-eyebrow-dot"></span>
      INVENTORY MANAGEMENT
    </div>

    <h1>
      Inventory Overview
    </h1>

    <p>
      Monitor stock levels, inventory value and
      warehouse activity across all departments.
    </p>

  </div>

  <div className="dashboard-date-box">

    <div className="dashboard-date-icon">
      <CalendarDays size={20} />
    </div>

    <div>
      <span>
        TODAY
      </span>

      <strong>
        {today.toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        )}
      </strong>

      <LiveClock />
    </div>

  </div>

</div>


{/* =========================
    KEY PERFORMANCE INDICATORS
========================= */}

<div className="dashboard-kpis">

  <div className="dashboard-kpi">

    <div className="dashboard-kpi-icon inventory">
      <Package size={22} />
    </div>

    <div className="dashboard-kpi-content">

      <span>
        INVENTORY RECORDS
      </span>

      <strong>
        {inventoryItems.length.toLocaleString()}
      </strong>

      <small>
        Active inventory items
      </small>

    </div>

  </div>


  <div className="dashboard-kpi">

    <div className="dashboard-kpi-icon value">
      <Wallet size={22} />
    </div>

    <div className="dashboard-kpi-content">

      <span>
        INVENTORY VALUE
      </span>

      <strong>
        M{" "}
        {totalInventoryCost.toLocaleString(
          "en-LS",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}
      </strong>

      <small>
        Current stock valuation
      </small>

    </div>

  </div>


  <div className="dashboard-kpi">

    <div className="dashboard-kpi-icon warning">
      <AlertTriangle size={22} />
    </div>

    <div className="dashboard-kpi-content">

      <span>
        LOW / CRITICAL STOCK
      </span>

      <strong>
        {lowOrCritical.length.toLocaleString()}
      </strong>

      <small>
        Items requiring attention
      </small>

    </div>

  </div>


  <div className="dashboard-kpi">

    <div className="dashboard-kpi-icon movement">
      <ArrowLeftRight size={22} />
    </div>

    <div className="dashboard-kpi-content">

      <span>
        RECENT MOVEMENTS
      </span>

      <strong>
        {recentMovements?.length ?? 0}
      </strong>

      <small>
        Latest stock transactions
      </small>

    </div>

  </div>

</div>

   {/* =========================
    DASHBOARD ANALYTICS
========================= */}

<div className="dashboard-analytics">

  {/* Main Analytics */}

  <div className="dashboard-analytics-main">

    <div className="dashboard-chart-card">

      <div className="dashboard-chart-header">

        <h2>
          Stock Movement Trend
        </h2>

        <p>
          Stock movement quantity recorded
          over the last 7 days.
        </p>

      </div>

      <StockMovementChart
        data={movementTrend}
      />

    </div>

  </div>


  {/* Supporting Analytics */}

  <div className="dashboard-analytics-side">

    {/* Critical Stock */}

<div className="dashboard-chart-card critical-stock-card">

  <div className="dashboard-chart-header critical-stock-header">

    <div>
      <h2>
        Stock Attention
      </h2>

      <p>
        Items currently below or approaching
        their control levels.
      </p>
    </div>

    <div className="critical-stock-count">
      {lowOrCritical.length}
    </div>

  </div>


  {lowOrCritical.length > 0 ? (

    <div className="critical-stock-list">

      {lowOrCritical
        .slice(0, 4)
        .map((item) => {

          const unit =
            Array.isArray(
              item.units_of_measure
            )
              ? item.units_of_measure[0]
              : item.units_of_measure;

          const isCritical =
            item.quantity <=
            item.minimum_level;

          return (
            <div
              className={`critical-stock-item ${
                isCritical
                  ? "critical"
                  : "low"
              }`}
              key={item.id}
            >

              <div className="critical-stock-indicator">
                <span></span>
              </div>


              <div className="critical-stock-info">

                <strong>
                  {item.name}
                </strong>

                <small>
                  {item.item_code}
                </small>

              </div>


              <div className="critical-stock-status">

                <span
                  className={`stock-status ${
                    isCritical
                      ? "critical"
                      : "low"
                  }`}
                >
                  {isCritical
                    ? "Critical"
                    : "Low"}
                </span>

                <strong>
                  {item.quantity}{" "}
                  {unit?.abbreviation || ""}
                </strong>

              </div>

            </div>
          );
        })}

    </div>

  ) : (

    <div className="critical-stock-empty">

      <div className="empty-check">
        ✓
      </div>

      <strong>
        Stock levels are healthy
      </strong>

      <p>
        No items currently require
        immediate attention.
      </p>

    </div>

  )}

</div>


    {/* Stock Health */}

    <div className="dashboard-chart-card">

      <div className="dashboard-chart-header">

        <h2>
          Stock Health
        </h2>

        <p>
          Current distribution according to
          stock control levels.
        </p>

      </div>

      <StockHealthChart
        data={stockHealth}
      />

    </div>

  </div>

</div>  

      
                      


      {/* =========================
          INVENTORY VALUE
          BY DEPARTMENT
      ========================= */}

      <div className="card">

        <h2>
          Inventory Value by Department
        </h2>

        <p>
          Current value of stock
          held across each
          department.
        </p>

        <InventoryValueChart
          data={departmentValues}
        />

      </div>




      {/* Inventory Records by Department */}

      <div className="card">

       <h2>
         Inventory Records by Department
       </h2>

      <p>
        Number of active inventory records
        managed by each department.
       </p>

     <DepartmentQuantityChart
     data={departmentQuantities}
    />

     </div>





      {/* =========================
          RECENT STOCK MOVEMENTS
      ========================= */}

      <div className="card">

        <h2>
          Recent Stock Movements
        </h2>

        <Table
          movements={
            recentMovements ?? []
          }
        />

      </div>

    </Page>
  );
}

/* =========================
   STATISTICS CARD
========================= */

function S({
  t,
  v,
  i,
}: {
  t: string;
  v: string | number;
  i: string;
}) {
  return (
    <div className="stat card">

      <span>
        {i}
      </span>

      <div>

        <small>
          {t}
        </small>

        <strong>
          {v}
        </strong>

      </div>

    </div>
  );
}

/* =========================
   MOVEMENTS TABLE
========================= */

function Table({
  movements,
}: {
  movements: any[];
}) {
  return (
    <div className="dashboard-movement-table">

      <div className="dashboard-table-wrapper">

        <table>

          <thead>
            <tr>
              <th>REFERENCE</th>
              <th>DATE</th>
              <th>ITEM</th>
              <th>FROM</th>
              <th>TO</th>
              <th>QUANTITY</th>
              <th>TYPE</th>
            </tr>
          </thead>

          <tbody>

            {movements.length > 0 ? (

              movements.map((movement) => {

                const fromDepartment =
                  Array.isArray(
                    movement.from_department
                  )
                    ? movement.from_department[0]
                    : movement.from_department;

                const toDepartment =
                  Array.isArray(
                    movement.to_department
                  )
                    ? movement.to_department[0]
                    : movement.to_department;

                const item =
                  Array.isArray(
                    movement.item
                  )
                    ? movement.item[0]
                    : movement.item;

                const unit =
                  Array.isArray(
                    item?.units_of_measure
                  )
                    ? item.units_of_measure[0]
                    : item?.units_of_measure;

                const movementType =
                  movement.movement_type;

                const typeClass =
                  movementType
                    .toLowerCase()
                    .replace(/\s+/g, "-");

                return (
                  <tr key={movement.id}>

                    <td>
                      <span className="movement-reference">
                        {movement.reference_number ||
                          "—"}
                      </span>
                    </td>

                    <td>
                      <span className="movement-date">
                        {new Date(
                          movement.created_at
                        ).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </td>

                    <td>

                      <div className="movement-item">

                        <strong>
                          {item?.name || "—"}
                        </strong>

                        {item?.item_code && (
                          <small>
                            {item.item_code}
                          </small>
                        )}

                      </div>

                    </td>

                    <td>
                      <span className="movement-department">
                        {fromDepartment?.name || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="movement-department">
                        {toDepartment?.name || "—"}
                      </span>
                    </td>

                    <td>
                      <strong className="movement-quantity">
                        {Number(
                          movement.quantity
                        ).toLocaleString(
                          "en-LS",
                          {
                            maximumFractionDigits: 2,
                          }
                        )}

                        {unit?.abbreviation && (
                          <small>
                            {" "}
                            {unit.abbreviation}
                          </small>
                        )}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`movement-badge ${typeClass}`}
                      >
                        {movementType}
                      </span>
                    </td>

                  </tr>
                );
              })

            ) : (

              <tr>

                <td
                  colSpan={7}
                  className="movement-empty"
                >
                  No stock movements recorded.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}