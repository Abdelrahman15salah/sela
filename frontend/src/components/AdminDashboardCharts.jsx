import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

export const ProductsOverTimeChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-slate-400">No data available yet.</div>;
    }

    // Format dates for the X-axis (e.g., "Mar 15")
    const formattedData = data.map(item => {
        const d = new Date(item.date);
        return {
            ...item,
            displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
    });

    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="displayDate"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        minTickGap={30}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        allowDecimals={false}
                    />
                    <RechartsTooltip
                        contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 600, color: '#0f172a' }}
                        itemStyle={{ color: '#8b5cf6', fontWeight: 500 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        name="Products Added"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export const CategoryDistributionChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-slate-400">No category data available.</div>;
    }

    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <RechartsTooltip
                        contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 500 }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
