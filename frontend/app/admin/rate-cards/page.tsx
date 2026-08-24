'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { RateCard, CODConfig, Zone } from '../../../types';
import { GoldDivider } from '../../../components/GoldDivider';
import { Calculator, DollarSign, Plus, Edit } from 'lucide-react';

export default function AdminRateCardsPage() {
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [codConfigs, setCODConfigs] = useState<CODConfig[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  // Rate Card Form Modal
  const [showRateModal, setShowRateModal] = useState(false);
  const [orderType, setOrderType] = useState<'B2B' | 'B2C'>('B2C');
  const [pricingType, setPricingType] = useState<'INTRA_ZONE' | 'INTER_ZONE'>('INTRA_ZONE');
  const [sourceZoneId, setSourceZoneId] = useState('');
  const [destZoneId, setDestZoneId] = useState('');
  const [baseRate, setBaseRate] = useState<number>(100);
  const [perKgRate, setPerKgRate] = useState<number>(20);
  const [minWeight, setMinWeight] = useState<number>(1.0);

  // COD Config Form Modal
  const [showCODModal, setShowCODModal] = useState(false);
  const [codOrderType, setCodOrderType] = useState<'B2B' | 'B2C'>('B2C');
  const [surchargeType, setSurchargeType] = useState<'FLAT' | 'PERCENTAGE'>('FLAT');
  const [surchargeValue, setSurchargeValue] = useState<number>(30);

  const fetchData = async () => {
    try {
      const [cardsRes, codRes, zonesRes]: any[] = await Promise.all([
        api.get('/rate-cards'),
        api.get('/rate-cards/cod'),
        api.get('/zones'),
      ]);

      if (cardsRes.success) setRateCards(cardsRes.data);
      if (codRes.success) setCODConfigs(codRes.data);
      if (zonesRes.success) {
        setZones(zonesRes.data);
        if (zonesRes.data.length >= 2) {
          setSourceZoneId(zonesRes.data[0].id);
          setDestZoneId(zonesRes.data[1].id);
        }
      }
    } catch (err) {
      console.error('Failed to load rate card configurations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveRateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await api.post('/rate-cards', {
        orderType,
        pricingType,
        sourceZoneId,
        destinationZoneId: destZoneId,
        baseRate: Number(baseRate),
        perKgRate: Number(perKgRate),
        minimumChargeableWeight: Number(minWeight),
      });

      if (res.success) {
        setShowRateModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(`Save rate card failed: ${err.message}`);
    }
  };

  const handleSaveCODConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await api.post('/rate-cards/cod', {
        orderType: codOrderType,
        surchargeType,
        surchargeValue: Number(surchargeValue),
      });

      if (res.success) {
        setShowCODModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(`Save COD config failed: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading rate cards & COD surcharges...</div>;
  }

  return (
    <div className="space-y-8 py-2">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Rate Card & COD Surcharge Management</h1>
          <p className="text-xs text-gray-400 mt-1">Configure base rates, per-kg pricing rules, and Cash-on-Delivery fees</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowRateModal(true)}
            className="bg-[#D4AF37] hover:bg-[#F0C75E] text-black font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Rate Card
          </button>
          <button
            onClick={() => setShowCODModal(true)}
            className="bg-[#141417] hover:bg-gray-800 text-gray-200 border border-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" /> Configure COD
          </button>
        </div>
      </div>

      {/* RATE CARDS TABLE */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#D4AF37]" /> Active Rate Cards
        </h2>

        <div className="bg-[#0E0E10] border border-[#D4AF37]/25 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#141417] text-gray-400 font-mono uppercase text-[10px] border-b border-gray-800">
                <tr>
                  <th className="p-4">Type</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Source Zone</th>
                  <th className="p-4">Destination Zone</th>
                  <th className="p-4">Base Rate</th>
                  <th className="p-4">Per Kg Rate</th>
                  <th className="p-4">Min. Weight</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {rateCards.map((rc) => (
                  <tr key={rc.id} className="hover:bg-[#141417]/50 transition-colors">
                    <td className="p-4 font-bold text-[#D4AF37]">{rc.orderType}</td>
                    <td className="p-4">{rc.pricingType}</td>
                    <td className="p-4">{rc.sourceZone?.code || rc.sourceZoneId}</td>
                    <td className="p-4">{rc.destinationZone?.code || rc.destinationZoneId}</td>
                    <td className="p-4 font-bold text-white">₹{rc.baseRate}</td>
                    <td className="p-4 font-bold text-white">₹{rc.perKgRate}/kg</td>
                    <td className="p-4">{rc.minimumChargeableWeight} kg</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <GoldDivider />

      {/* COD CONFIGURATIONS */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#D4AF37]" /> Cash-on-Delivery Surcharges
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {codConfigs.map((cod) => (
            <div
              key={cod.id}
              className="bg-[#0E0E10] border border-[#D4AF37]/30 rounded-xl p-5 flex items-center justify-between shadow-xl"
            >
              <div>
                <span className="text-xs font-mono font-bold text-[#D4AF37] block">{cod.orderType} COD SURCHARGE</span>
                <span className="text-lg font-bold text-white mt-1 block">
                  {cod.surchargeType === 'FLAT' ? `₹${cod.surchargeValue} Flat Amount` : `${cod.surchargeValue}% of Delivery Charge`}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#141417] border border-gray-700 text-xs font-mono text-gray-300">
                {cod.surchargeType}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RATE CARD MODAL */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E0E10] border border-[#D4AF37] rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white">Configure Rate Card Rule</h3>
              <button onClick={() => setShowRateModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveRateCard} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-300 mb-1">Order Type</label>
                  <select value={orderType} onChange={(e) => setOrderType(e.target.value as any)} className="input-field w-full">
                    <option value="B2C">B2C (Consumer)</option>
                    <option value="B2B">B2B (Enterprise)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-300 mb-1">Pricing Type</label>
                  <select value={pricingType} onChange={(e) => setPricingType(e.target.value as any)} className="input-field w-full">
                    <option value="INTRA_ZONE">INTRA_ZONE</option>
                    <option value="INTER_ZONE">INTER_ZONE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-300 mb-1">Source Zone</label>
                  <select value={sourceZoneId} onChange={(e) => setSourceZoneId(e.target.value)} className="input-field w-full">
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-300 mb-1">Destination Zone</label>
                  <select value={destZoneId} onChange={(e) => setDestZoneId(e.target.value)} className="input-field w-full">
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-gray-300 mb-1">Base Rate (₹)</label>
                  <input type="number" min="0" value={baseRate} onChange={(e) => setBaseRate(Number(e.target.value))} className="input-field w-full" />
                </div>
                <div>
                  <label className="block font-medium text-gray-300 mb-1">Per Kg Rate (₹)</label>
                  <input type="number" min="0" value={perKgRate} onChange={(e) => setPerKgRate(Number(e.target.value))} className="input-field w-full" />
                </div>
                <div>
                  <label className="block font-medium text-gray-300 mb-1">Min. Wt (kg)</label>
                  <input type="number" min="0.1" step="0.1" value={minWeight} onChange={(e) => setMinWeight(Number(e.target.value))} className="input-field w-full" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowRateModal(false)} className="px-4 py-2 rounded bg-[#141417] text-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-[#D4AF37] text-black font-bold">Save Rate Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COD MODAL */}
      {showCODModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E0E10] border border-[#D4AF37] rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white">Configure COD Policy</h3>
              <button onClick={() => setShowCODModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveCODConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-300 mb-1">Order Type</label>
                <select value={codOrderType} onChange={(e) => setCodOrderType(e.target.value as any)} className="input-field w-full">
                  <option value="B2C">B2C (Consumer)</option>
                  <option value="B2B">B2B (Enterprise)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-300 mb-1">Surcharge Type</label>
                <select value={surchargeType} onChange={(e) => setSurchargeType(e.target.value as any)} className="input-field w-full">
                  <option value="FLAT">FLAT (Fixed Amount in ₹)</option>
                  <option value="PERCENTAGE">PERCENTAGE (% of Delivery Charge)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-300 mb-1">Surcharge Value</label>
                <input
                  type="number"
                  min="0"
                  value={surchargeValue}
                  onChange={(e) => setSurchargeValue(Number(e.target.value))}
                  className="input-field w-full"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowCODModal(false)} className="px-4 py-2 rounded bg-[#141417] text-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-[#D4AF37] text-black font-bold">Save COD Policy</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
