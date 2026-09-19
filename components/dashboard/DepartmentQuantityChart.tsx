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

type DepartmentQuantity = {
  name: string;
  quantity: number;
};

type Props = {
  data: DepartmentQuantity[];
};

export default function DepartmentQuantityChart({
  data,
}: Props) {
  return (
    <div className="dashboard-department-quantity-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 10,
            right: 25,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
          />

          <XAxis
            type="number"
            tick={{
              fontSize: 11,
            }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />

          <YAxis
            type="category"
            dataKey="name"
            width={155}
            tick={{
              fontSize: 10,
            }}
            tickLine={false}
            axisLine={false}
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
              Number(value).toLocaleString(),
              "Stock Quantity",
            ]}
          />

          <Bar
            dataKey="quantity"
            name="Stock Quantity"
            fill="#2563eb"
            radius={[0, 6, 6, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}