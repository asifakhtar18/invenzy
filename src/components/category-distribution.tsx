"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

// Sample data - in a real app, this would come from your API
const data = [
  { name: "Meat", value: 35, color: "#ff6384" },
  { name: "Produce", value: 25, color: "#36a2eb" },
  { name: "Dairy", value: 15, color: "#ffce56" },
  { name: "Dry Goods", value: 20, color: "#4bc0c0" },
  { name: "Beverages", value: 5, color: "#9966ff" },
]

export function CategoryDistribution() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} items`, "Quantity"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

