'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';
import { Order } from '../../../../types';
import { TrackingTimeline } from '../../../../components/TrackingTimeline';
import { StatusBadge } from '../../../../components/StatusBadge';
import { GoldDivider } from '../../../../components/GoldDivider';
import { MapPin, Truck, Phone, Calendar, RefreshCw, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function TrackingPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reschedule Modal State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleMessage, setRescheduleMessage] = useState('');

  const fetchOrderDetails = async () => {
    try {
      const res: any = await api.get(`/orders/${orderId}`);
      if (res.success) {
        setOrder(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tracking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    setRescheduling(true);
    setRescheduleMessage('');

    try {
      const res: any = await api.post(`/orders/${orderId}/reschedule`, {
        newScheduledDate: new Date(newDate).toISOString(),
      });

      if (res.success) {
        setRescheduleMessage('Order rescheduled successfully! A new delivery agent has been assigned.');
        setShowRescheduleModal(false);
        fetchOrderDetails();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reschedule order');
    } finally {
      setRescheduling(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading shipment tracking timeline...</div>;
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-10 text-center space-y-4">
        <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-sm">
          {error || 'Order tracking record not found'}
        </div>
        <Link href="/customer/dashboard" className="inline-flex items-center gap-1 text-[#D4AF37] hover:underline font-semibold text-xs">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const latestAttempt = order.deliveryAttempts && order.deliveryAttempts.length > 0
    ? order.deliveryAttempts[order.deliveryAttempts.length - 1]
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white font-mono tracking-wider">{order.orderNumber}</h1>
            <StatusBadge status={order.currentStatus} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Order Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        <Link
          href="/customer/dashboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4AF37] bg-[#141417] hover:bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-md transition-all w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Portal Dashboard
        </Link>
      </div>

      {rescheduleMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{rescheduleMessage}</span>
        </div>
      )}

      {/* FAILED DELIVERY BANNER & RESCHEDULE ACTION */}
      {order.currentStatus === 'FAILED' && (
        <div className="bg-rose-950/40 border-2 border-rose-500/60 rounded-xl p-5 space-y-3 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-rose-900/60 text-rose-300">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-200">Delivery Attempt Failed</h3>
                <p className="text-xs text-rose-300">
                  Reason: <span className="font-mono font-semibold">{latestAttempt?.failureReason || 'CUSTOMER_UNAVAILABLE'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRescheduleModal(true)}
              className="bg-[#D4AF37] hover:bg-[#F0C75E] text-black font-bold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" /> Reschedule Delivery
            </button>
          </div>
        </div>
      )}

      {/* SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pickup & Destination */}
        <div className="bg-[#0E0E10] border border-[#D4AF37]/25 rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#D4AF37]" /> Route Information
          </div>
          <div className="text-xs space-y-2">
            <div>
              <span className="text-gray-500 block text-[10px]">PICKUP LOCATION</span>
              <span className="text-white font-medium">{order.pickupAddress}</span>
              <span className="text-[#D4AF37] block font-mono text-[11px]">{order.pickupZone?.name}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">DROP DESTINATION</span>
              <span className="text-white font-medium">{order.dropAddress}</span>
              <span className="text-[#D4AF37] block font-mono text-[11px]">{order.dropZone?.name}</span>
            </div>
          </div>
        </div>

        {/* Agent Information */}
        <div className="bg-[#0E0E10] border border-[#D4AF37]/25 rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#D4AF37]" /> Assigned Delivery Agent
          </div>
          {order.assignedAgent ? (
            <div className="text-xs space-y-2">
              <div>
                <span className="text-gray-500 block text-[10px]">AGENT NAME</span>
                <span className="text-white font-bold text-sm">{order.assignedAgent.user.name}</span>
                <span className="text-[#D4AF37] font-mono block text-[11px]">{order.assignedAgent.employeeCode}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-300 font-mono">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> {order.assignedAgent.user.phone || order.assignedAgent.phone}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4 font-mono">No agent assigned yet (Pending dispatch)</p>
          )}
        </div>

        {/* Order Pricing & Schedule */}
        <div className="bg-[#0E0E10] border border-[#D4AF37]/25 rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#D4AF37]" /> Schedule & Pricing
          </div>
          <div className="text-xs space-y-2 font-mono">
            <div>
              <span className="text-gray-500 block text-[10px]">SCHEDULED DATE</span>
              <span className="text-white font-semibold">
                {new Date(order.scheduledDeliveryDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">TOTAL CHARGE ({order.paymentType})</span>
              <span className="text-[#D4AF37] text-base font-extrabold">₹{order.totalCharge}</span>
            </div>
          </div>
        </div>

      </div>

      <GoldDivider />

      {/* CHRONOLOGICAL TRACKING TIMELINE */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-wide">Tracking Timeline History</h2>
        {order.trackingEvents && order.trackingEvents.length > 0 ? (
          <TrackingTimeline events={order.trackingEvents} />
        ) : (
          <p className="text-xs text-gray-500">No tracking events recorded</p>
        )}
      </div>

      {/* RESCHEDULE MODAL */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E0E10] border border-[#D4AF37] rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#D4AF37]" /> Reschedule Failed Delivery
              </h3>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Select New Delivery Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div className="p-3 bg-[#141417] border border-gray-800 rounded-lg text-xs text-gray-400 space-y-1">
                <div>ℹ️ <strong>System Reschedule Policy:</strong></div>
                <div>• Transitions status to <span className="text-purple-400 font-mono font-semibold">RESCHEDULED</span></div>
                <div>• Creates new Delivery Attempt record</div>
                <div>• Triggers automatic re-assignment to a new available agent</div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 rounded-md bg-[#141417] hover:bg-gray-800 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduling}
                  className="px-4 py-2 rounded-md bg-[#D4AF37] hover:bg-[#F0C75E] text-black text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {rescheduling ? 'Processing...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
