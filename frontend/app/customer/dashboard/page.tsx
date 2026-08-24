'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Order } from '../../../types';
import { MetricCard } from '../../../components/MetricCard';
import { StatusBadge } from '../../../components/StatusBadge';
import { GoldDivider } from '../../../components/GoldDivider';
import { Package, Truck, CheckCircle2, AlertTriangle, Plus, ArrowRight } from 'lucide-react';

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res: any = await api.get('/orders');
        if (res.success) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Failed to load customer orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const total = orders.length;
  const active = orders.filter((o) => ['CREATED', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.currentStatus)).length;
  const delivered = orders.filter((o) => o.currentStatus === 'DELIVERED').length;
  const failed = orders.filter((o) => o.currentStatus === 'FAILED' || o.currentStatus === 'RESCHEDULED').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">Customer Logistics Portal</h1>
          <p className="text-xs text-gray-400 mt-1">Manage delivery orders, track active shipments, and handle rescheduling</p>
        </div>

        <Link
          href="/customer/orders/create"
          className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F0C75E] text-black font-bold px-4 py-2 rounded-lg text-sm transition-all shadow-md w-fit"
        >
          <Plus className="w-4 h-4" /> Create New Order
        </Link>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Orders" value={total} icon={Package} />
        <MetricCard title="Active Shipments" value={active} icon={Truck} trend="In Transit / Out for Delivery" />
        <MetricCard title="Delivered" value={delivered} icon={CheckCircle2} />
        <MetricCard title="Reschedule Action" value={failed} icon={AlertTriangle} trend="Requires Rescheduling" />
      </div>

      <GoldDivider />

      {/* RECENT ORDERS TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-wide">Your Deliveries</h2>
          <span className="text-xs font-mono text-[#D4AF37]">{orders.length} Records</span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500 text-sm">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-[#0E0E10] border border-gray-800 rounded-xl p-10 text-center space-y-3">
            <Package className="w-10 h-10 text-[#D4AF37] mx-auto opacity-50" />
            <p className="text-gray-300 text-sm font-medium">No delivery orders found</p>
            <Link
              href="/customer/orders/create"
              className="inline-block text-xs font-semibold text-[#D4AF37] hover:underline"
            >
              + Place your first order
            </Link>
          </div>
        ) : (
          <div className="bg-[#0E0E10] border border-[#D4AF37]/25 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#141417] text-gray-400 font-mono uppercase text-[10px] border-b border-gray-800">
                  <tr>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Pickup Area</th>
                    <th className="p-4">Destination Area</th>
                    <th className="p-4">Type / Payment</th>
                    <th className="p-4">Chargeable Wt.</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-sans">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#141417]/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#D4AF37]">{ord.orderNumber}</td>
                      <td className="p-4 truncate max-w-[150px]">{ord.pickupAddress}</td>
                      <td className="p-4 truncate max-w-[150px]">{ord.dropAddress}</td>
                      <td className="p-4 font-mono">{ord.orderType} • {ord.paymentType}</td>
                      <td className="p-4 font-mono">{ord.chargeableWeight} kg</td>
                      <td className="p-4 font-mono font-bold text-white">₹{ord.totalCharge}</td>
                      <td className="p-4">
                        <StatusBadge status={ord.currentStatus} />
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/customer/orders/${ord.id}/tracking`}
                          className="inline-flex items-center gap-1 text-[#D4AF37] hover:underline font-semibold"
                        >
                          Track <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
