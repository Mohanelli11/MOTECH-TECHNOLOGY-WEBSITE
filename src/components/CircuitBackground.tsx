import React from 'react';

type CircuitBackgroundProps = {
  className?: string;
  opacity?: number;
};

const traces = [
'M0 90 H180 L220 130 H420 L460 90 H720',
'M0 220 H120 L160 180 H340 L380 220 H620 L660 260 H900',
'M40 340 H260 L300 300 H520 L560 340 H820',
'M0 430 H200 L240 470 H460 L500 430 H760',
'M120 20 V120 L160 160 V260',
'M540 0 V80 L580 120 V240 L620 280 V420',
'M300 480 V380 L340 340 V200',
'M760 460 V360 L800 320 V160'];


const pads: Array<[number, number]> = [
[180, 90],
[420, 130],
[340, 180],
[660, 260],
[520, 300],
[240, 470],
[580, 120],
[800, 320]];


/**
 * Decorative circuit-board layer: etched traces, solder pads and
 * animated data-flow pulses. Purely visual.
 */
export function CircuitBackground({
  className = '',
  opacity = 0.5
}: CircuitBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}>
      
      <svg
        viewBox="0 0 900 500"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full">
        
        <defs>
          <linearGradient id="traceGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00AEEF" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#59C414" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#00AEEF" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {traces.map((d) =>
        <path
          key={d}
          d={d}
          fill="none"
          stroke="url(#traceGrad)"
          strokeWidth="1.4" />

        )}

        {traces.slice(0, 5).map((d, i) =>
        <path
          key={`flow-${d}`}
          d={d}
          fill="none"
          stroke={i % 2 === 0 ? '#00AEEF' : '#59C414'}
          strokeWidth="1.8"
          strokeLinecap="round"
          className="data-flow"
          style={{ animationDelay: `${i * 0.7}s` }} />

        )}

        {pads.map(([cx, cy], i) =>
        <g key={`${cx}-${cy}`}>
            <circle
            cx={cx}
            cy={cy}
            r="6"
            fill="none"
            stroke={i % 2 === 0 ? '#00AEEF' : '#59C414'}
            strokeOpacity="0.45"
            strokeWidth="1.2" />
          
            <circle
            cx={cx}
            cy={cy}
            r="2"
            fill={i % 2 === 0 ? '#00AEEF' : '#59C414'}
            fillOpacity="0.7" />
          
          </g>
        )}

        {/* microchips */}
        {[
        [430, 200],
        [140, 300],
        [700, 120]].
        map(([x, y], i) =>
        <g key={`chip-${x}`} opacity="0.55">
            <rect
            x={x}
            y={y}
            width="52"
            height="52"
            rx="6"
            fill="#0B1829"
            stroke="#C7D2DC"
            strokeOpacity="0.35" />
          
            <rect
            x={x + 14}
            y={y + 14}
            width="24"
            height="24"
            rx="3"
            fill="none"
            stroke={i % 2 === 0 ? '#00AEEF' : '#59C414'}
            strokeOpacity="0.6" />
          
            {[0, 1, 2, 3].map((p) =>
          <g key={p}>
                <line
              x1={x + 10 + p * 11}
              y1={y}
              x2={x + 10 + p * 11}
              y2={y - 10}
              stroke="#C7D2DC"
              strokeOpacity="0.3" />
            
                <line
              x1={x + 10 + p * 11}
              y1={y + 52}
              x2={x + 10 + p * 11}
              y2={y + 62}
              stroke="#C7D2DC"
              strokeOpacity="0.3" />
            
              </g>
          )}
          </g>
        )}
      </svg>
    </div>);

}