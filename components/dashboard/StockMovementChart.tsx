"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type MovementData = {
  date: string;
  quantity: number;
};

type Props = {
  data: MovementData[];
};

export default function StockMovementChart({
  data,
}: Props) {
  return (
    <div className="dashboard-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 15,
            right: 20,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tick={{
              fontSize: 11,
            }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tick={{
              fontSize: 11,
            }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
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
              "Movement Quantity",
            ]}
          />

          <Line
            type="monotone"
            dataKey="quantity"
            name="Movement Quantity"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{
              r: 4,
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}