'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoldDivider } from '../components/GoldDivider';
import { Truck, ShieldCheck, MapPin, Calculator, Search, ArrowRight, RefreshCw, Layers } from 'lucide-react';

export default function LandingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      router.push(`/customer/orders/${trackingNumber.trim()}/tracking`);
    }
  };

  return (
    <div className="space-y-16 py-6">
      
      {/* HERO SECTION */}
      <section className="text-center space-y-6 pt-10 pb-6 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/40 bg-[#0E0E10] text-[#D4AF37] text-xs font-mono tracking-widest uppercase mb-4 shadow-lg shadow-[#D4AF37]/5">
          <Truck className="w-3.5 h-3.5" /> Next-Generation Last-Mile Logistics
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          LAST-MILE DELIVERY <br />
          <span className="bg-gradient-to-r from-white via-[#F0C75E] to-[#D4AF37] bg-clip-text text-transparent">
            TRACKED TO THE LAST DETAIL.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Enterprise logistics powered by dynamic zone detection, volumetric pricing engines, deterministic agent auto-assignment, and immutable tracking history.
        </p>

        {/* Quick Tracking Search Bar */}
        <form onSubmit={handleTrack} className="max-w-md mx-auto pt-4">
          <div className="flex items-center bg-[#0E0E10] border border-[#D4AF37]/40 rounded-lg p-1.5 focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/30 transition-all shadow-xl">
            <Search className="w-5 h-5 text-gray-400 ml-3 mr-2" />
            <input
              type="text"
              placeholder="Enter Order Number (e.g. ORD-2026-0001)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-gray-500"
            />
            <button
              type="submit"
              className="bg-[#D4AF37] hover:bg-[#F0C75E] text-black font-semibold px-4 py-2 rounded-md text-sm transition-all flex items-center gap-1 shadow-md"
            >
              Track <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
          <Link
            href="/customer/orders/create"
            className="bg-gradient-to-r from-[#D4AF37] to-[#C9A227] hover:from-[#F0C75E] hover:to-[#D4AF37] text-black font-bold px-6 py-3 rounded-lg shadow-lg shadow-[#D4AF37]/20 transition-all transform hover:-translate-y-0.5"
          >
            Create Delivery Order
          </Link>
          <Link
            href="/login"
            className="bg-[#0E0E10] hover:bg-[#141417] text-white font-semibold px-6 py-3 rounded-lg border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all"
          >
            Sign In to Portal
          </Link>
        </div>
      </section>

      <GoldDivider />

      {/* FEATURE GRID */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
            ENTERPRISE CAPABILITIES
          </h2>
          <p className="text-sm text-gray-400">Architected for transparency, accuracy, and operational speed</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-[#0E0E10] border border-[#D4AF37]/20 rounded-xl p-6 hover:border-[#D4AF37]/60 transition-all space-y-3">
            <div className="p-3 w-fit rounded-lg bg-[#141417] text-[#D4AF37] border border-[#D4AF37]/30">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Volumetric Rate Engine</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Calculates volumetric weight using <code className="text-[#D4AF37] bg-black/60 px-1 rounded">(L×B×H)/5000</code>. Selects higher of actual and volumetric weight before applying B2B/B2C intra/inter zone rate cards.
            </p>
          </div>

          <div className="bg-[#0E0E10] border border-[#D4AF37]/20 rounded-xl p-6 hover:border-[#D4AF37]/60 transition-all space-y-3">
            <div className="p-3 w-fit rounded-lg bg-[#141417] text-[#D4AF37] border border-[#D4AF37]/30">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Agent Proximity Auto-Assign</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ranks available agents using Haversine geographical distance and pickup zone matching to automatically dispatch parcels in real-time.
            </p>
          </div>

          <div className="bg-[#0E0E10] border border-[#D4AF37]/20 rounded-xl p-6 hover:border-[#D4AF37]/60 transition-all space-y-3">
            <div className="p-3 w-fit rounded-lg bg-[#141417] text-[#D4AF37] border border-[#D4AF37]/30">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Failed-Delivery Rescheduling</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Failed delivery attempts capture explicit failure reasons, clear previous agent assignments, and immediately assign a new available agent upon customer reschedule.
            </p>
          </div>

        </div>
      </section>

      <GoldDivider />

      {/* HOW IT WORKS */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
            THE DELIVERY LIFECYCLE
          </h2>
          <p className="text-sm text-gray-400">Strict state machine transition validation with append-only audit logs</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          {[
            { step: '01', title: 'Created', desc: 'Customer submits order' },
            { step: '02', title: 'Confirmed', desc: 'Price breakdown verified' },
            { step: '03', title: 'Assigned', desc: 'Nearest agent dispatched' },
            { step: '04', title: 'Picked Up', desc: 'Agent retrieves parcel' },
            { step: '05', title: 'In Transit', desc: 'Hub transfer en route' },
            { step: '06', title: 'Out for Delivery', desc: 'Final leg dispatch' },
            { step: '07', title: 'Delivered', desc: 'Completed with audit log' },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#0E0E10] border border-[#D4AF37]/20 rounded-lg p-4 space-y-2 hover:border-[#D4AF37] transition-all">
              <span className="text-xs font-mono font-bold text-[#D4AF37]">{item.step}</span>
              <h4 className="text-sm font-semibold text-white">{item.title}</h4>
              <p className="text-[11px] text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
