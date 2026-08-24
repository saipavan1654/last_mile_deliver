import React from 'react';
import { TrackingEvent } from '../types';
import { CheckCircle2, Clock, Truck, Package, AlertTriangle, RefreshCw, UserCheck } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ events }) => {
  const getEventIcon = (status: string) => {
    switch (status) {
      case 'CREATED':
      case 'CONFIRMED':
        return <Package className="w-4 h-4 text-[#D4AF37]" />;
      case 'ASSIGNED':
        return <UserCheck className="w-4 h-4 text-blue-400" />;
      case 'PICKED_UP':
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        return <Truck className="w-4 h-4 text-[#D4AF37]" />;
      case 'DELIVERED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'FAILED':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'RESCHEDULED':
        return <RefreshCw className="w-4 h-4 text-purple-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="flow-root my-6">
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => {
          const isLast = eventIdx === events.length - 1;
          const formattedDate = new Date(event.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <li key={event.id || eventIdx}>
              <div className="relative pb-8">
                {/* Gold Vertical Connector Line */}
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gradient-to-b from-[#D4AF37] to-[#D4AF37]/20"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-4 items-start">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-[#0E0E10] border-2 border-[#D4AF37] flex items-center justify-center ring-4 ring-[#050505] shadow-md">
                      {getEventIcon(event.status)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 bg-[#0E0E10] border border-gray-800 rounded-lg p-4 shadow-sm hover:border-[#D4AF37]/40 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={event.status} />
                        <span className="text-xs text-gray-400 font-mono">
                          by {event.actor?.name || event.actorRole}
                        </span>
                      </div>
                      <time className="text-xs text-gray-500 font-mono">{formattedDate}</time>
                    </div>

                    {event.remarks && (
                      <p className="mt-2 text-sm text-gray-300 font-sans">{event.remarks}</p>
                    )}

                    {(event.latitude && event.longitude) && (
                      <div className="mt-2 text-[11px] text-[#D4AF37] font-mono flex items-center gap-1">
                        📍 Coordinates: {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
