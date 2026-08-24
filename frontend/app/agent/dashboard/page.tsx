'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { Order, OrderStatus, AgentAvailability } from '../../../types';
import { StatusBadge } from '../../../components/StatusBadge';
import { GoldDivider } from '../../../components/GoldDivider';
import { Truck, MapPin, CheckCircle2, AlertTriangle, Radio, Navigation, Clock, User, Phone } from 'lucide-react';

export default function AgentDashboard() {
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Agent Location & Availability Form State
  const [availability, setAvailability] = useState<AgentAvailability>('AVAILABLE');
  const [latitude, setLatitude] = useState<number>(12.9716);
  const [longitude, setLongitude] = useState<number>(77.5946);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Failure Reason Modal State
  const [selectedOrderIdForFailure, setSelectedOrderIdForFailure] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState('CUSTOMER_UNAVAILABLE');
  const [failureRemarks, setFailureRemarks] = useState('');
  const [submittingFailure, setSubmittingFailure] = useState(false);

  const fetchAgentData = async () => {
    try {
      const [profileRes, ordersRes]: any[] = await Promise.all([
        api.get('/agents/me'),
        api.get('/orders'),
      ]);

      if (profileRes.success) {
        setAgentProfile(profileRes.data);
        setAvailability(profileRes.data.availabilityStatus);
        if (profileRes.data.currentLatitude) setLatitude(profileRes.data.currentLatitude);
        if (profileRes.data.currentLongitude) setLongitude(profileRes.data.currentLongitude);
      }

      if (ordersRes.success) {
        setOrders(ordersRes.data);
      }
    } catch (err) {
      console.error('Failed to load agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, []);

  const handleAvailabilityToggle = async (newStatus: AgentAvailability) => {
    setUpdatingStatus(true);
    try {
      const res: any = await api.patch('/agents/me/availability', { availabilityStatus: newStatus });
      if (res.success) {
        setAvailability(newStatus);
      }
    } catch (err) {
      console.error('Failed to update availability:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleLocationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await api.patch('/agents/me/location', { latitude: Number(latitude), longitude: Number(longitude) });
      if (res.success) {
        alert('GPS location updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update GPS location:', err);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus, extraData: any = {}) => {
    try {
      const res: any = await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        latitude: Number(latitude),
        longitude: Number(longitude),
        ...extraData,
      });

      if (res.success) {
        fetchAgentData();
      }
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleFailureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderIdForFailure) return;
    setSubmittingFailure(true);

    try {
      await handleStatusUpdate(selectedOrderIdForFailure, 'FAILED', {
        failureReason,
        remarks: failureRemarks || `Failure reason: ${failureReason}`,
      });
      setSelectedOrderIdForFailure(null);
    } finally {
      setSubmittingFailure(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading delivery agent workspace...</div>;
  }

  return (
    <div className="space-y-8 py-2">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white tracking-wide">
              {agentProfile?.user?.name || 'Delivery Agent Portal'}
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-mono text-xs font-bold">
              {agentProfile?.employeeCode || 'AGT'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Zone: {agentProfile?.currentZone?.name || 'Default Zone A'}</p>
        </div>

        {/* AVAILABILITY TOGGLE BUTTONS */}
        <div className="flex items-center space-x-2 bg-[#0E0E10] border border-[#D4AF37]/30 p-1.5 rounded-lg w-fit">
          <span className="text-xs font-mono text-gray-400 mr-2 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-[#D4AF37]" /> Status:
          </span>
          {(['AVAILABLE', 'BUSY', 'OFFLINE'] as AgentAvailability[]).map((st) => (
            <button
              key={st}
              onClick={() => handleAvailabilityToggle(st)}
              disabled={updatingStatus}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                availability === st
                  ? st === 'AVAILABLE'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : st === 'BUSY'
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'bg-rose-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* AGENT GPS LOCATION UPDATER WIDGET */}
      <div className="bg-[#0E0E10] border border-[#D4AF37]/25 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#D4AF37]" /> Agent GPS Location Metrics
          </h3>
          <span className="text-[11px] text-gray-400 font-mono">Used for auto-assignment ranking</span>
        </div>

        <form onSubmit={handleLocationUpdate} className="flex flex-wrap items-end gap-3 text-xs">
          <div>
            <label className="block text-gray-400 text-[10px] mb-1">Latitude (°N)</label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
              className="input-field w-36"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-[10px] mb-1">Longitude (°E)</label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
              className="input-field w-36"
            />
          </div>
          <button
            type="submit"
            className="bg-[#141417] hover:bg-gray-800 text-[#D4AF37] border border-[#D4AF37]/40 px-4 py-2 rounded-md font-semibold text-xs transition-all"
          >
            Update Coordinates
          </button>
        </form>
      </div>

      <GoldDivider />

      {/* ASSIGNED DELIVERIES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-wide">Assigned Delivery Jobs</h2>
          <span className="text-xs font-mono text-[#D4AF37]">{orders.length} Active Orders</span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#0E0E10] border border-gray-800 rounded-xl p-10 text-center text-gray-400 text-sm">
            <Truck className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            No active deliveries assigned to your queue currently. Ensure your status is set to <span className="text-emerald-400 font-mono">AVAILABLE</span>.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-[#0E0E10] border border-[#D4AF37]/30 rounded-xl p-5 space-y-4 shadow-xl hover:border-[#D4AF37] transition-all relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold font-mono text-[#D4AF37]">{ord.orderNumber}</span>
                  <StatusBadge status={ord.currentStatus} />
                </div>

                <div className="text-xs space-y-2 border-y border-gray-800/80 py-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-500 text-[10px] block">PICKUP ADDRESS</span>
                      <span className="text-white">{ord.pickupAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-500 text-[10px] block">DROP DESTINATION</span>
                      <span className="text-white">{ord.dropAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
                    <span>Customer: {ord.customer?.name}</span>
                    <span className="text-white font-bold">₹{ord.totalCharge} ({ord.paymentType})</span>
                  </div>
                </div>

                {/* STATUS TRANSITION BUTTON ACTIONS */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-gray-500 block uppercase">Update Delivery Lifecycle</span>
                  
                  <div className="flex flex-wrap gap-2">
                    {ord.currentStatus === 'ASSIGNED' && (
                      <button
                        onClick={() => handleStatusUpdate(ord.id, 'PICKED_UP', { remarks: 'Picked up from warehouse' })}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-semibold shadow"
                      >
                        Mark Picked Up
                      </button>
                    )}

                    {ord.currentStatus === 'PICKED_UP' && (
                      <button
                        onClick={() => handleStatusUpdate(ord.id, 'IN_TRANSIT', { remarks: 'En route to local transit hub' })}
                        className="bg-amber-600 hover:bg-amber-500 text-black px-3 py-1.5 rounded text-xs font-semibold shadow"
                      >
                        Mark In Transit
                      </button>
                    )}

                    {ord.currentStatus === 'IN_TRANSIT' && (
                      <button
                        onClick={() => handleStatusUpdate(ord.id, 'OUT_FOR_DELIVERY', { remarks: 'Agent dispatched for final delivery' })}
                        className="bg-[#D4AF37] hover:bg-[#F0C75E] text-black px-3 py-1.5 rounded text-xs font-bold shadow"
                      >
                        Mark Out for Delivery
                      </button>
                    )}

                    {ord.currentStatus === 'OUT_FOR_DELIVERY' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(ord.id, 'DELIVERED', { remarks: 'Delivered to customer successfully' })}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-bold shadow flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Delivered
                        </button>

                        <button
                          onClick={() => setSelectedOrderIdForFailure(ord.id)}
                          className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded text-xs font-bold shadow flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Mark Failed
                        </button>
                      </>
                    )}

                    {['DELIVERED', 'FAILED', 'CANCELLED'].includes(ord.currentStatus) && (
                      <span className="text-xs text-gray-500 font-mono italic">Order reached terminal/transition state</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAILURE REASON SELECTION MODAL */}
      {selectedOrderIdForFailure && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E0E10] border border-rose-500/50 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Record Delivery Failure Reason
              </h3>
              <button
                onClick={() => setSelectedOrderIdForFailure(null)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFailureSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Failure Reason (Mandatory)</label>
                <select
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="CUSTOMER_UNAVAILABLE">CUSTOMER_UNAVAILABLE — Recipient not present</option>
                  <option value="WRONG_ADDRESS">WRONG_ADDRESS — Incorrect address or pincode</option>
                  <option value="ADDRESS_NOT_ACCESSIBLE">ADDRESS_NOT_ACCESSIBLE — Locked gate or restricted zone</option>
                  <option value="CUSTOMER_REJECTED">CUSTOMER_REJECTED — Parcel refused by recipient</option>
                  <option value="OTHER">OTHER — Unforeseen delivery impediment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Additional Remarks</label>
                <textarea
                  rows={3}
                  value={failureRemarks}
                  onChange={(e) => setFailureRemarks(e.target.value)}
                  placeholder="Attempted phone calls at 2:15 PM and 2:30 PM..."
                  className="input-field w-full"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderIdForFailure(null)}
                  className="px-4 py-2 rounded-md bg-[#141417] hover:bg-gray-800 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFailure}
                  className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {submittingFailure ? 'Logging Failure...' : 'Submit Failure Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
