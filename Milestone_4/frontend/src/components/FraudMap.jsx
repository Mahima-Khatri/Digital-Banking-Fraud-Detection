import React, { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { ShieldCheck, Monitor, HelpCircle, Plus, Minus, Move, Activity, Zap } from "lucide-react";

// Simplified Low-Poly World Map URL
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const FraudMap = ({ transactions }) => {
  // 1. Zoom and View State
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  const handleZoomIn = () => {
    if (position.zoom >= 10) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const [hoveredNode, setHoveredNode] = useState(null);

  // 2. Data Processing (Clean Signal-Point System)
  const { liveNodes, latestUpdate } = useMemo(() => {
    const recent = (transactions || []).slice(-50);
    const lastTx = recent[recent.length - 1];

    const nodes = recent.map(tx => ({
      ...tx,
      riskColor: tx.isFraud ? "#f43f5e" : tx.isMediumRisk ? "#f59e0b" : "#22c55e",
      riskLabel: tx.isFraud ? "CRITICAL" : tx.isMediumRisk ? "ANOMALY" : "SAFE",
    }));

    return { 
      liveNodes: nodes, 
      latestUpdate: lastTx ? `${lastTx.senderLocation}: ${lastTx.status?.toUpperCase()}` : "Monitoring Nodes..."
    };
  }, [transactions]);

  return (
    <div className="glass-card p-6 flex flex-col h-full min-h-[660px] relative overflow-hidden">
      {/* Precision Map Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/10 rounded-lg border border-white/5">
            <ShieldCheck className="text-white/40 w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white/90">Regional Threat Matrix</h3>
            <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest mt-0.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live Telemetry Stream
            </p>
          </div>
        </div>
        <div className="flex items-center bg-black/20 px-3 py-1 rounded-md border border-white/5">
           <Zap size={10} className="text-primary mr-2" />
           <p className="text-[10px] font-black text-white/40 uppercase tracking-tighter truncate max-w-[150px]">
             Latest: <span className="text-white/80">{latestUpdate}</span>
           </p>
        </div>
      </div>

      {/* SVG Map (Neutral Dark Background + Point Colors Only) */}
      {/* FIXED: Added strict clipping and fixed height to prevent "Screen-wide" zoom feel */}
      <div className="flex-1 bg-[#020617] rounded-3xl border border-white/5 relative flex items-center justify-center overflow-hidden shadow-2xl max-h-[480px]">
        
        {/* ZOOM UI (Locked to Card Bounds) */}
        <div className="absolute top-6 left-6 z-[20] flex flex-col gap-1.5">
           <button onClick={handleZoomIn} className="w-8 h-8 bg-slate-900/60 border border-white/10 rounded-lg flex items-center justify-center hover:bg-slate-800 text-white/40 hover:text-white transition-all backdrop-blur-md shadow-xl">
             <Plus size={14} />
           </button>
           <button onClick={handleZoomOut} className="w-8 h-8 bg-slate-900/60 border border-white/10 rounded-lg flex items-center justify-center hover:bg-slate-800 text-white/40 hover:text-white transition-all backdrop-blur-md shadow-xl">
             <Minus size={14} />
           </button>
        </div>

        <ComposableMap
          projectionConfig={{ scale: 145 }}
          width={800}
          height={400}
          style={{ width: "100%", height: "100%", maxHeight: "100%" }}
        >
          <ZoomableGroup zoom={position.zoom} center={position.coordinates} onMoveEnd={setPosition}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth={0.5}
                    fill="#0f172a"
                    style={{ default: { outline: "none" } }}
                  />
                ))
              }
            </Geographies>

            {/* Smart Scaling Points: Dots stay the SAME SIZE regardless of zoom level */}
            {liveNodes.map((tx, idx) => (
              <Marker key={tx.transactionId + idx} coordinates={[tx.longitude, tx.latitude]}>
                <circle 
                  // Divide radius by zoom to keep dots consistent in size while map zooms
                  r={5 / Math.sqrt(position.zoom)} 
                  fill={tx.riskColor} 
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredNode(tx)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>

        {/* Global Intelligence HUD Overlay (Positioned to never extend outside card) */}
        {hoveredNode && (
          <div 
            className="absolute top-6 right-6 p-5 min-w-[240px] rounded-2xl border backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none"
            style={{ 
              backgroundColor: `${hoveredNode.riskColor}10`,
              borderColor: `${hoveredNode.riskColor}40`,
              boxShadow: `0 10px 40px -10px ${hoveredNode.riskColor}20`
            }}
          >
             <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Signal Node Analysis</p>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredNode.riskColor }} />
             </div>

             <div className="space-y-1">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none">Intelligence Report</p>
                <div className="flex items-end justify-between gap-4">
                   <h4 className="text-xl font-black text-white leading-none truncate uppercase tracking-tighter">
                     {hoveredNode.senderLocation}
                   </h4>
                   <span className="text-[10px] font-black px-1.5 py-0.5 rounded border mb-0.5" style={{ color: hoveredNode.riskColor, borderColor: `${hoveredNode.riskColor}40` }}>
                     {hoveredNode.riskLabel}
                   </span>
                </div>
             </div>

             <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div>
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Risk Score</p>
                   <p className="text-sm font-black text-white">{(hoveredNode.fraudScore * 100).toFixed(1)}%</p>
                </div>
                <div className="text-right">
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Channel</p>
                   <p className="text-sm font-black text-white/60">NODE-A{hoveredNode.transactionId.slice(-3)}</p>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Modern Status Legends */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card !bg-white/5 p-4 flex items-center justify-between border border-white/5 rounded-2xl md:col-span-3">
          <div className="flex gap-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#f43f5e]" /> 
              <span className="text-[10px] font-bold uppercase text-white/40">Critical</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#f59e0b]" /> 
              <span className="text-[10px] font-bold uppercase text-white/40">Anomaly</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#22c55e]" /> 
              <span className="text-[10px] font-bold uppercase text-white/40">Stable</span>
            </div>
          </div>
          <p className="hidden xl:block text-[8px] text-white/20 font-bold uppercase tracking-widest">Precision Signal Point Distribution System</p>
        </div>

        <div className="glass-card !bg-transparent p-4 border border-white/5 flex items-center gap-4 rounded-2xl">
          <div className="bg-white/5 p-2 rounded-lg border border-white/5">
            <Monitor className="text-white/20 w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter whitespace-nowrap">Zoom: x{position.zoom.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
};

export default FraudMap;
