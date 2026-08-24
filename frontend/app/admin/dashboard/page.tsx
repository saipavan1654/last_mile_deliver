'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { MetricCard } from '../../../components/MetricCard';
import { GoldDivider } from '../../../components/GoldDivider';
import { Package, Truck, CheckCircle2, AlertTriangle, UserCheck, DollarSign, BarChart3, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res: any = await api.get('/admin/dashboard');
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading admin analytics dashboard...</div>;
  }

  const statusBreakdownData = data?.statusBreakdown
    ? Object.entries(data.statusBreakdown).map(([name, value]) => ({ name: name.replace(/_/g, ' '), count: value }))
    : [];

  const pieColors = ['#D4AF37', '#60A5FA', '#34D399', '#F87171', '#C084FC', '#9CA3AF'];

  return (
    <div className="space-y-8 py-2">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">Logistics Command Center</h1>
          <p className="text-xs text-gray-400 mt-1">Real-time system telemetry, agent availability, and revenue analytics</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] bg-[#0E0E10] border border-[#D4AF37]/30 px-3 py-1.5 rounded-lg w-fit">
          <Activity className="w-4 h-4 animate-pulse" /> Live Telemetry System Active
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Volume" value={data?.totalOrders || 0} icon={Package} />
        <MetricCard title="Total Revenue" value={`₹${data?.totalRevenue || 0}`} icon={DollarSign} trend="Calculated from rate cards" />
        <MetricCard title="In Transit" value={data?.inTransit || 0} icon={Truck} />
        <MetricCard title="Out for Delivery" value={data?.outForDelivery || 0} icon={Package} />
        <MetricCard title="Delivered" value={data?.delivered || 0} icon={CheckCircle2} />
        <MetricCard title="Failed Deliveries" value={data?.failed || 0} icon={AlertTriangle} trend="Requires customer reschedule" />
        <MetricCard title="Available Agents" value={data?.availableAgents || 0} icon={UserCheck} trend="Ready for auto-assignment" />
        <MetricCard title="Pending Dispatch" value={data?.pending || 0} icon={BarChart3} />
      </div>

      <GoldDivider />

      {/* RECHARTS ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BAR CHART: ORDERS BY STATUS */}
        <div className="bg-[#0E0E10] border border-[#D4AF37]/25 rounded-xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#D4AF37]" /> Order Volume Distribution by Lifecycle Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBreakdownData}>
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E0E10', borderColor: '#D4AF37', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: STATUS PROPORTION */}
        <div className="bg-[#0E0E10] border border-[#D4AF37]/25 rounded-xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#D4AF37]" /> Order Status Share
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdownData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E0E10', borderColor: '#D4AF37', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
