'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { Order, OrderStatus, Zone } from '../../../types';
import { StatusBadge } from '../../../components/StatusBadge';
import { GoldDivider } from '../../../components/GoldDivider';
import { Search, Filter, UserCheck, ShieldAlert, ChevronLeft, ChevronRight, RefreshCw, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Assignment Modal
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<Order | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Override Modal
  const [selectedOrderForOverride, setSelectedOrderForOverride] = useState<Order | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<OrderStatus>('CONFIRMED');
  const [overrideRemarks, setOverrideRemarks] = useState('');
  const [overriding, setOverriding] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(zoneFilter ? { zoneId: zoneFilter } : {}),
      });

      const res: any = await api.get(`/admin/orders?${query.toString()}`);
      if (res.success) {
        setOrders(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadAuxData() {
      try {
        const [zonesRes, agentsRes]: any[] = await Promise.all([
          api.get('/zones'),
          api.get('/admin/agents'),
        ]);
        if (zonesRes.success) setZones(zonesRes.data);
        if (agentsRes.success) setAgents(agentsRes.data);
      } catch (err) {
        console.error('Failed to load auxiliary admin data:', err);
      }
    }
    loadAuxData();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, zoneFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleAssignAgentSubmit = async (autoAssign: boolean) => {
    if (!selectedOrderForAssign) return;
    setAssigning(true);

    try {
      const res: any = await api.post(`/orders/${selectedOrderForAssign.id}/assign`, {
        agentId: autoAssign ? undefined : selectedAgentId,
        autoAssign,
      });

      if (res.success) {
        alert(autoAssign ? 'Agent auto-assigned successfully!' : 'Agent assigned manually!');
        setSelectedOrderForAssign(null);
        fetchOrders();
      }
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForOverride) return;
    setOverriding(true);

    try {
      const res: any = await api.patch(`/orders/${selectedOrderForOverride.id}/status`, {
        status: overrideStatus,
        remarks: overrideRemarks || 'Status overridden by Admin',
      });

      if (res.success) {
        alert('Order status overridden cleanly with tracking audit log!');
        setSelectedOrderForOverride(null);
        fetchOrders();
      }
    } catch (err: any) {
      alert(`Override failed: ${err.message}`);
    } finally {
      setOverriding(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Order Management Console</h1>
          <p className="text-xs text-gray-400 mt-1">Search, filter, assign agents, and override shipment statuses</p>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="bg-[#0E0E10] border border-[#D4AF37]/25 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center w-full md:w-80">
          <input
            type="text"
            placeholder="Search by Order # or Address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-full rounded-r-none"
          />
          <button
            type="submit"
            className="bg-[#D4AF37] hover:bg-[#F0C75E] text-black px-3 py-2 rounded-r-md font-bold text-xs"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          <div className="flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-gray-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="input-field py-1 text-xs"
            >
              <option value="">All Statuses</option>
              {['CREATED', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RESCHEDULED', 'CANCELLED'].map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-gray-400">Zone:</span>
            <select
              value={zoneFilter}
              onChange={(e) => {
                setZoneFilter(e.target.value);
                setPage(1);
              }}
              className="input-field py-1 text-xs"
            >
              <option value="">All Zones</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* ORDERS TABLE */}
      {loading ? (
        <div className="text-center py-16 text-gray-500 text-sm">Querying database records...</div>
      ) : orders.length === 0 ? (
        <div className="bg-[#0E0E10] border border-gray-800 rounded-xl p-10 text-center text-gray-400 text-sm">
          No orders match the selected search or filter criteria.
        </div>
      ) : (
        <div className="bg-[#0E0E10] border border-[#D4AF37]/25 rounded-xl overflow-hidden shadow-2xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#141417] text-gray-400 font-mono uppercase text-[10px] border-b border-gray-800">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Route (Pickup → Drop)</th>
                  <th className="p-4">Assigned Agent</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-sans">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#141417]/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#D4AF37]">{ord.orderNumber}</td>
                    <td className="p-4 font-medium text-white">{ord.customer?.name || 'Customer'}</td>
                    <td className="p-4 font-mono text-[11px]">
                      {ord.pickupZone?.code || 'P'} ➔ {ord.dropZone?.code || 'D'}
                    </td>
                    <td className="p-4">
                      {ord.assignedAgent ? (
                        <span className="text-white font-medium">{ord.assignedAgent.user.name}</span>
                      ) : (
                        <span className="text-gray-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold text-white">₹{ord.totalCharge}</td>
                    <td className="p-4">
                      <StatusBadge status={ord.currentStatus} />
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/customer/orders/${ord.id}/tracking`}
                        className="inline-flex items-center p-1.5 rounded bg-[#141417] text-gray-300 hover:text-[#D4AF37] border border-gray-700"
                        title="View Tracking Audit History"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => {
                          setSelectedOrderForAssign(ord);
                          if (agents.length > 0) setSelectedAgentId(agents[0].id);
                        }}
                        className="inline-flex items-center p-1.5 rounded bg-[#141417] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/40 transition-colors"
                        title="Assign Agent (Manual / Auto)"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrderForOverride(ord);
                          setOverrideStatus(ord.currentStatus);
                        }}
                        className="inline-flex items-center p-1.5 rounded bg-rose-950/40 text-rose-300 hover:bg-rose-900 border border-rose-500/40 transition-colors"
                        title="Override Status (Admin Override)"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          <div className="flex items-center justify-between p-4 bg-[#141417] border-t border-gray-800 text-xs font-mono">
            <span className="text-gray-400">Page {page} of {totalPages}</span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded bg-[#0E0E10] border border-gray-700 text-gray-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded bg-[#0E0E10] border border-gray-700 text-gray-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN AGENT MODAL */}
      {selectedOrderForAssign && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E0E10] border border-[#D4AF37] rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#D4AF37]" /> Assign Agent — {selectedOrderForAssign.orderNumber}
              </h3>
              <button onClick={() => setSelectedOrderForAssign(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-[#141417] rounded-lg border border-[#D4AF37]/30 text-xs space-y-1">
                <div className="text-gray-400">⚡ <strong>Trigger Auto-Assignment Algorithm:</strong></div>
                <div className="text-gray-300">Ranks AVAILABLE agents by zone proximity and Haversine distance.</div>
                <button
                  onClick={() => handleAssignAgentSubmit(true)}
                  disabled={assigning}
                  className="w-full mt-2 bg-[#D4AF37] hover:bg-[#F0C75E] text-black font-bold py-2 rounded text-xs shadow-md disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Trigger Auto-Assignment'}
                </button>
              </div>

              <GoldDivider />

              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-300">Or Select Agent Manually</label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="input-field w-full"
                >
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.user?.name} ({ag.employeeCode}) — Status: {ag.availabilityStatus}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleAssignAgentSubmit(false)}
                  disabled={assigning}
                  className="w-full bg-[#141417] hover:bg-gray-800 text-white border border-gray-700 font-bold py-2 rounded text-xs disabled:opacity-50"
                >
                  Assign Selected Agent Manually
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN STATUS OVERRIDE MODAL */}
      {selectedOrderForOverride && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E0E10] border border-rose-500/60 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Admin Status Override — {selectedOrderForOverride.orderNumber}
              </h3>
              <button onClick={() => setSelectedOrderForOverride(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleStatusOverrideSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Target Status</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value as OrderStatus)}
                  className="input-field w-full"
                >
                  {['CREATED', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RESCHEDULED', 'CANCELLED'].map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Mandatory Override Audit Remarks</label>
                <textarea
                  rows={3}
                  required
                  value={overrideRemarks}
                  onChange={(e) => setOverrideRemarks(e.target.value)}
                  placeholder="Reason for manual administrative override..."
                  className="input-field w-full"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForOverride(null)}
                  className="px-4 py-2 rounded bg-[#141417] text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={overriding}
                  className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {overriding ? 'Applying Override...' : 'Confirm Status Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
