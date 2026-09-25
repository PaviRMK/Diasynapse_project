import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

const PALETTE = ['#C85A32', '#8E4D70', '#5E8C70', '#D98967', '#A95D7D', '#78A072'];

function CustomBarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-warm border border-cream-300 text-xs">
        <p className="font-semibold text-charcoal-900">{data.name}</p>
        <p className="text-terracotta-700 font-bold metric-number mt-0.5">
          {data.carbs}g <span className="text-[10px] font-normal text-charcoal-500">(AI-Estimated)</span>
        </p>
      </div>
    );
  }
  return null;
}

export function CarbBreakdownChart({ items = [], height = 150 }) {
  if (!items || items.length <= 1) return null;

  const chartData = items.map((item, i) => ({
    name: item.food_name || `Item ${i + 1}`,
    carbs: Number(item.estimated_carbs_g) || 0,
  }));

  const totalCarbs = chartData.reduce((acc, curr) => acc + curr.carbs, 0);

  return (
    <div className="bg-cream-50/70 border border-cream-300 rounded-xl p-4 my-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-cream-200">
        <div>
          <h4 className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
            Carbohydrate Distribution
          </h4>
          <p className="text-[11px] text-charcoal-500">
            Breakdown across {items.length} detected meal items
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-charcoal-500">Total: </span>
          <span className="text-sm font-bold text-terracotta-700 metric-number">
            {totalCarbs.toFixed(1)}g
          </span>
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#343A40', fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar
              dataKey="carbs"
              radius={[0, 6, 6, 0]}
              barSize={16}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
