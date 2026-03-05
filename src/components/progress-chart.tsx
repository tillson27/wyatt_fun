"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SnapshotData {
  date: string;
  Alpha: number;
  Bravo: number;
  Charlie: number;
}

export function ProgressChart({ data }: { data: SnapshotData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis domain={[0, 100]} fontSize={12} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="Alpha"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="Bravo"
          stroke="#16a34a"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="Charlie"
          stroke="#ea580c"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
