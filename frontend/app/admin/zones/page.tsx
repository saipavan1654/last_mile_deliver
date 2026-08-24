'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { Zone, Area } from '../../../types';
import { GoldDivider } from '../../../components/GoldDivider';
import { MapPin, Plus, Layers, Edit } from 'lucide-react';

export default function AdminZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Zone Modal State
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [zoneCode, setZoneCode] = useState('');
  const [zoneDesc, setZoneDesc] = useState('');

  // Create Area Modal State
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [areaPincode, setAreaPincode] = useState('');
  const [targetZoneId, setTargetZoneId] = useState('');

  const fetchZones = async () => {
    try {
      const res: any = await api.get('/zones');
      if (res.success) {
        setZones(res.data);
        if (res.data.length > 0) setTargetZoneId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch zones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await api.post('/zones', {
        name: zoneName,
        code: zoneCode,
        description: zoneDesc,
      });

      if (res.success) {
        setShowZoneModal(false);
        setZoneName('');
        setZoneCode('');
        setZoneDesc('');
        fetchZones();
      }
    } catch (err: any) {
      alert(`Create zone failed: ${err.message}`);
    }
  };

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await api.post('/zones/areas', {
        name: areaName,
        pincode: areaPincode,
        zoneId: targetZoneId,
      });

      if (res.success) {
        setShowAreaModal(false);
        setAreaName('');
        setAreaPincode('');
        fetchZones();
      }
    } catch (err: any) {
      alert(`Create area failed: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading zone configurations...</div>;
  }

  return (
    <div className="space-y-6 py-2">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Geographic Zone & Area Configuration</h1>
          <p className="text-xs text-gray-400 mt-1">Configure zones and pincode areas for rate card selection & auto-assignment</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowZoneModal(true)}
            className="bg-[#D4AF37] hover:bg-[#F0C75E] text-black font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-md"
          >
            <Plus className="w-4 h-4" /> Create Zone
          </button>
          <button
            onClick={() => setShowAreaModal(true)}
            className="bg-[#141417] hover:bg-gray-800 text-gray-200 border border-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" /> Add Area / Pincode
          </button>
        </div>
      </div>

      {/* ZONE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="bg-[#0E0E10] border border-[#D4AF37]/30 rounded-xl p-5 space-y-4 shadow-xl hover:border-[#D4AF37] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded bg-[#141417] text-[#D4AF37] border border-[#D4AF37]/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{zone.name}</h3>
                  <span className="text-xs font-mono text-[#D4AF37] font-semibold">{zone.code}</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                ACTIVE
              </span>
            </div>

            {zone.description && (
              <p className="text-xs text-gray-400">{zone.description}</p>
            )}

            <GoldDivider />

            {/* ASSOCIATED AREAS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                <span>Associated Areas & Pincodes</span>
                <span>{zone.areas?.length || 0} Areas</span>
              </div>

              {zone.areas && zone.areas.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {zone.areas.map((ar) => (
                    <div
                      key={ar.id}
                      className="p-2 rounded bg-[#141417] border border-gray-800 flex items-center justify-between"
                    >
                      <span className="text-gray-200 truncate">{ar.name}</span>
                      <span className="text-[#D4AF37] font-bold ml-2">[{ar.pincode}]</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No areas configured in this zone</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ZONE MODAL */}
      {showZoneModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E0E10] border border-[#D4AF37] rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4AF37]" /> Create New Geographic Zone
              </h3>
              <button onClick={() => setShowZoneModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zone D - Eastern Hub"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Zone Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ZONE-D"
                  value={zoneCode}
                  onChange={(e) => setZoneCode(e.target.value)}
                  className="input-field w-full font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={zoneDesc}
                  onChange={(e) => setZoneDesc(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowZoneModal(false)}
                  className="px-4 py-2 rounded bg-[#141417] text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#D4AF37] text-black text-xs font-bold shadow-md"
                >
                  Create Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE AREA MODAL */}
      {showAreaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E0E10] border border-[#D4AF37] rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#D4AF37]" /> Add Area & Pincode to Zone
              </h3>
              <button onClick={() => setShowAreaModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateArea} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Area Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyber City Phase 2"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 560099"
                  value={areaPincode}
                  onChange={(e) => setAreaPincode(e.target.value)}
                  className="input-field w-full font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Assign to Zone</label>
                <select
                  value={targetZoneId}
                  onChange={(e) => setTargetZoneId(e.target.value)}
                  className="input-field w-full"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>{z.name} ({z.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAreaModal(false)}
                  className="px-4 py-2 rounded bg-[#141417] text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#D4AF37] text-black text-xs font-bold shadow-md"
                >
                  Add Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
