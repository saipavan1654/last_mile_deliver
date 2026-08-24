'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { Zone, Area, PriceBreakdown } from '../../../types';
import { GoldDivider } from '../../../components/GoldDivider';
import { Calculator, ArrowRight, ArrowLeft, CheckCircle, Package, MapPin, CreditCard, Sparkles } from 'lucide-react';

export default function CreateOrderPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [zones, setZones] = useState<Zone[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);

  // Form State
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupAreaId, setPickupAreaId] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [dropAreaId, setDropAreaId] = useState('');

  const [length, setLength] = useState<number>(50);
  const [breadth, setBreadth] = useState<number>(40);
  const [height, setHeight] = useState<number>(30);
  const [actualWeight, setActualWeight] = useState<number>(8);

  const [orderType, setOrderType] = useState<'B2B' | 'B2C'>('B2C');
  const [paymentType, setPaymentType] = useState<'PREPAID' | 'COD'>('COD');

  // Calculated Price State from Backend
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchZones() {
      try {
        const res: any = await api.get('/zones');
        if (res.success) {
          setZones(res.data);
          const allAreas: Area[] = [];
          res.data.forEach((z: Zone) => {
            if (z.areas) allAreas.push(...z.areas);
          });
          setAreas(allAreas);
          if (allAreas.length >= 2) {
            setPickupAreaId(allAreas[0].id);
            setDropAreaId(allAreas[allAreas.length - 1].id);
          }
        }
      } catch (err) {
        console.error('Failed to load zones:', err);
      } finally {
        setLoadingZones(false);
      }
    }
    fetchZones();
  }, []);

  const handleCalculatePrice = async () => {
    setError('');
    setCalculating(true);
    try {
      const res: any = await api.post('/orders/calculate-price', {
        pickupAreaId,
        dropAreaId,
        length: Number(length),
        breadth: Number(breadth),
        height: Number(height),
        actualWeight: Number(actualWeight),
        orderType,
        paymentType,
      });

      if (res.success) {
        setPriceBreakdown(res.data);
        setStep(4);
      }
    } catch (err: any) {
      setError(err.message || 'Price calculation failed');
    } finally {
      setCalculating(false);
    }
  };

  const handleConfirmOrder = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res: any = await api.post('/orders', {
        pickupAddress,
        pickupAreaId,
        dropAddress,
        dropAreaId,
        length: Number(length),
        breadth: Number(breadth),
        height: Number(height),
        actualWeight: Number(actualWeight),
        orderType,
        paymentType,
      });

      if (res.success) {
        router.push(`/customer/orders/${res.data.id}/tracking`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to confirm order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-8">
      {/* HEADER */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-wide">Create Delivery Order</h1>
        <p className="text-xs text-gray-400">Step-by-step volumetric pricing & order confirmation</p>
      </div>

      {/* STEPPER PROGRESS */}
      <div className="flex items-center justify-between bg-[#0E0E10] border border-[#D4AF37]/30 rounded-xl p-4">
        {[
          { num: 1, label: 'Addresses', icon: MapPin },
          { num: 2, label: 'Dimensions', icon: Package },
          { num: 3, label: 'Terms', icon: CreditCard },
          { num: 4, label: 'Price Preview', icon: Calculator },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <div key={s.num} className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                  isActive
                    ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 ring-2 ring-[#D4AF37]'
                    : isDone
                    ? 'bg-emerald-900 text-emerald-300 border border-emerald-500'
                    : 'bg-[#141417] text-gray-500 border border-gray-800'
                }`}
              >
                {isDone ? '✓' : s.num}
              </div>
              <span className={`text-xs hidden sm:inline font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* STEP 1: ADDRESSES */}
      {step === 1 && (
        <div className="bg-[#0E0E10] border border-[#D4AF37]/25 rounded-xl p-6 space-y-6 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#D4AF37]" /> Step 1: Pickup & Drop Location
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Pickup Address</label>
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="e.g. 100 Innovation Way, Suite 4B"
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Pickup Area & Zone</label>
              <select
                value={pickupAreaId}
                onChange={(e) => setPickupAreaId(e.target.value)}
                className="input-field w-full"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (Pincode: {a.pincode}) — {a.zone?.name || 'Zone'}
                  </option>
                ))}
              </select>
            </div>

            <GoldDivider />

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Drop / Destination Address</label>
              <input
                type="text"
                value={dropAddress}
                onChange={(e) => setDropAddress(e.target.value)}
                placeholder="e.g. 500 Palm Grove, Apt 12"
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Drop Area & Zone</label>
              <select
                value={dropAreaId}
                onChange={(e) => setDropAreaId(e.target.value)}
                className="input-field w-full"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (Pincode: {a.pincode}) — {a.zone?.name || 'Zone'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              if (!pickupAddress || !dropAddress) {
                setError('Please provide valid pickup and drop addresses');
                return;
              }
              setError('');
              setStep(2);
            }}
            className="w-full bg-[#D4AF37] hover:bg-[#F0C75E] text-black font-bold py-2.5 rounded-md transition-all shadow-md text-sm flex items-center justify-center gap-2"
          >
            Next: Package Dimensions <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: DIMENSIONS & WEIGHT */}
      {step === 2 && (
        <div className="bg-[#0E0E10] border border-[#D4AF37]/25 rounded-xl p-6 space-y-6 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-[#D4AF37]" /> Step 2: Weight & Parcel Dimensions
          </h2>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Length (cm)</label>
              <input
                type="number"
                min="1"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Breadth (cm)</label>
              <input
                type="number"
                min="1"
                value={breadth}
                onChange={(e) => setBreadth(Number(e.target.value))}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Height (cm)</label>
              <input
                type="number"
                min="1"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="input-field w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Actual Weight (kg)</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={actualWeight}
              onChange={(e) => setActualWeight(Number(e.target.value))}
              className="input-field w-full"
            />
          </div>

          <div className="p-3 bg-[#141417] border border-[#D4AF37]/20 rounded-lg text-xs font-mono text-[#D4AF37] space-y-1">
            <div>📐 Instant Volumetric Formula: (L × B × H) / 5000</div>
            <div>Estimated Volumetric Weight: {((length * breadth * height) / 5000).toFixed(2)} kg</div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="w-1/3 bg-[#141417] hover:bg-gray-800 text-gray-300 font-semibold py-2.5 rounded-md transition-all text-sm flex items-center justify-center gap-1 border border-gray-700"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="w-2/3 bg-[#D4AF37] hover:bg-[#F0C75E] text-black font-bold py-2.5 rounded-md transition-all shadow-md text-sm flex items-center justify-center gap-2"
            >
              Next: Order & Payment Terms <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TERMS & PAYMENT TYPE */}
      {step === 3 && (
        <div className="bg-[#0E0E10] border border-[#D4AF37]/25 rounded-xl p-6 space-y-6 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#D4AF37]" /> Step 3: Order Category & Payment Method
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Order Category</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('B2C')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    orderType === 'B2C'
                      ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white'
                      : 'bg-[#141417] border-gray-800 text-gray-400'
                  }`}
                >
                  <span className="block text-sm font-bold">B2C (Consumer)</span>
                  <span className="block text-[11px] text-gray-400 mt-0.5">Standard consumer parcel delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('B2B')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    orderType === 'B2B'
                      ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white'
                      : 'bg-[#141417] border-gray-800 text-gray-400'
                  }`}
                >
                  <span className="block text-sm font-bold">B2B (Enterprise)</span>
                  <span className="block text-[11px] text-gray-400 mt-0.5">Commercial freight & corporate delivery</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentType('COD')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    paymentType === 'COD'
                      ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white'
                      : 'bg-[#141417] border-gray-800 text-gray-400'
                  }`}
                >
                  <span className="block text-sm font-bold">Cash on Delivery (COD)</span>
                  <span className="block text-[11px] text-gray-400 mt-0.5">Applies configured COD surcharge</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('PREPAID')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    paymentType === 'PREPAID'
                      ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white'
                      : 'bg-[#141417] border-gray-800 text-gray-400'
                  }`}
                >
                  <span className="block text-sm font-bold">Prepaid</span>
                  <span className="block text-[11px] text-gray-400 mt-0.5">Zero surcharge rate</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="w-1/3 bg-[#141417] hover:bg-gray-800 text-gray-300 font-semibold py-2.5 rounded-md transition-all text-sm flex items-center justify-center gap-1 border border-gray-700"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleCalculatePrice}
              disabled={calculating}
              className="w-2/3 bg-[#D4AF37] hover:bg-[#F0C75E] text-black font-bold py-2.5 rounded-md transition-all shadow-md text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {calculating ? 'Calculating Price Engine...' : 'Calculate Delivery Estimate'} <Calculator className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: LIVE PRICE BREAKDOWN PREVIEW & CONFIRMATION */}
      {step === 4 && priceBreakdown && (
        <div className="bg-[#0E0E10] border border-[#D4AF37] rounded-xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" /> DELIVERY ESTIMATE BREAKDOWN
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Calculated by Backend Rate Calculation Engine</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] text-xs font-mono font-bold">
              {priceBreakdown.pricingType}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#141417] p-3 rounded-lg border border-gray-800">
              <span className="text-gray-500 block">Pickup Zone</span>
              <span className="text-white font-bold">{priceBreakdown.pickupZoneName}</span>
            </div>
            <div className="bg-[#141417] p-3 rounded-lg border border-gray-800">
              <span className="text-gray-500 block">Drop Zone</span>
              <span className="text-white font-bold">{priceBreakdown.dropZoneName}</span>
            </div>
            <div className="bg-[#141417] p-3 rounded-lg border border-gray-800">
              <span className="text-gray-500 block">Actual Weight</span>
              <span className="text-white">{priceBreakdown.actualWeight} kg</span>
            </div>
            <div className="bg-[#141417] p-3 rounded-lg border border-gray-800">
              <span className="text-gray-500 block">Volumetric Weight</span>
              <span className="text-white">{priceBreakdown.volumetricWeight} kg</span>
            </div>
          </div>

          <div className="bg-[#141417] p-4 rounded-lg border border-[#D4AF37]/40 space-y-2 text-sm">
            <div className="flex justify-between font-mono">
              <span className="text-gray-400">Chargeable Weight (MAX):</span>
              <span className="text-[#D4AF37] font-bold">{priceBreakdown.chargeableWeight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Base Delivery Charge:</span>
              <span className="text-white font-mono">₹{priceBreakdown.baseCharge}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Weight Charge:</span>
              <span className="text-white font-mono">₹{priceBreakdown.weightCharge}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">COD Surcharge ({paymentType}):</span>
              <span className="text-white font-mono">₹{priceBreakdown.codSurcharge}</span>
            </div>

            <GoldDivider />

            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">TOTAL PRICE:</span>
              <span className="text-[#D4AF37] font-mono">₹{priceBreakdown.totalCharge}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="w-1/3 bg-[#141417] hover:bg-gray-800 text-gray-300 font-semibold py-3 rounded-md transition-all text-sm border border-gray-700"
            >
              Modify Terms
            </button>
            <button
              onClick={handleConfirmOrder}
              disabled={submitting}
              className="w-2/3 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] hover:from-[#F0C75E] hover:to-[#D4AF37] text-black font-extrabold py-3 rounded-md transition-all shadow-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Confirming Order...' : 'Confirm Order & Dispatch'} <CheckCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
