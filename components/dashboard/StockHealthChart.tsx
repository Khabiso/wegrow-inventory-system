"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type StockHealthData = {
  name: string;
  value: number;
};

type Props = {
  data: StockHealthData[];
};

const COLORS = {
  Good: "#16a34a",
  Low: "#f59e0b",
  Critical: "#dc2626",
};

export default function StockHealthChart({
  data,
}: Props) {
  return (
    <div className="dashboard-stock-health-chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={78}
            outerRadius={115}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  COLORS[
                    entry.name as keyof typeof COLORS
                  ] || "#94a3b8"
                }
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              boxShadow:
                "0 8px 24px rgba(15, 23, 42, 0.08)",
              fontSize: "12px",
            }}
          />

          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              fontSize: "12px",
              color: "#475569",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}