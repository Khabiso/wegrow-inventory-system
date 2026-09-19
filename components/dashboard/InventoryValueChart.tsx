"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DepartmentValue = {
  name: string;
  value: number;
};

type Props = {
  data: DepartmentValue[];
};

export default function InventoryValueChart({
  data,
}: Props) {
  return (
    <div className="dashboard-inventory-value-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 15,
            right: 20,
            left: 5,
            bottom: 65,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{
              fontSize: 10,
            }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-25}
            textAnchor="end"
          />

          <YAxis
            tick={{
              fontSize: 11,
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              `M${Number(value).toLocaleString()}`
            }
          />

          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              boxShadow:
                "0 8px 24px rgba(15, 23, 42, 0.08)",
              fontSize: "12px",
            }}
            labelStyle={{
              fontWeight: 600,
              marginBottom: "4px",
            }}
            formatter={(value) => [
              `M ${Number(value).toLocaleString(
                "en-LS",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}`,
              "Inventory Value",
            ]}
          />

          <Bar
            dataKey="value"
            name="Inventory Value"
            fill="#2563eb"
            radius={[6, 6, 0, 0]}
            maxBarSize={42}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}