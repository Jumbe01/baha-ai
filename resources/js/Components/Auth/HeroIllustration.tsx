/**
 * Stylized dusk scene for the auth hero panel: mountains, a river with a bridge,
 * and a solar-powered IoT water-level monitoring station with a wifi signal.
 * Hand-built SVG so it stays crisp and themeable.
 */
export default function HeroIllustration({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 480 320"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#0d2547" />
                    <stop offset="1" stopColor="#123058" />
                </linearGradient>
                <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#2b568f" />
                    <stop offset="1" stopColor="#16345e" />
                </linearGradient>
            </defs>

            <rect width="480" height="320" fill="url(#sky)" />

            {/* Moon glow */}
            <circle cx="360" cy="70" r="34" fill="#1c3f6e" opacity="0.6" />
            <circle cx="360" cy="70" r="22" fill="#2b568f" opacity="0.5" />

            {/* Far mountains */}
            <path d="M0 150 L90 95 L170 150 L250 100 L340 155 L420 110 L480 150 V200 H0 Z" fill="#0e2a4f" />
            <path d="M0 175 L70 135 L150 175 L230 140 L320 180 L400 145 L480 180 V220 H0 Z" fill="#12335e" />

            {/* Trees silhouette */}
            {[30, 55, 78, 405, 430, 452].map((x, i) => (
                <path
                    key={x}
                    d={`M${x} 190 l6 -18 l6 18 Z M${x + 2} 178 l4 -14 l4 14 Z`}
                    fill="#0c2647"
                    opacity={0.9 - i * 0.05}
                />
            ))}

            {/* River */}
            <path d="M0 200 H480 V320 H0 Z" fill="url(#river)" />
            {[220, 245, 272, 300].map((y, i) => (
                <path
                    key={y}
                    d={`M${20 + i * 10} ${y} q40 -6 90 0 t120 0 t150 0`}
                    stroke="#4a79bd"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity={0.5 - i * 0.08}
                    fill="none"
                />
            ))}

            {/* Bridge */}
            <g stroke="#0b1f3a" strokeWidth="4" opacity="0.85">
                <line x1="70" y1="205" x2="210" y2="205" />
                <path d="M80 205 q30 -22 60 0 M140 205 q30 -22 60 0" fill="none" strokeWidth="3" />
                {[90, 120, 160, 190].map((x) => (
                    <line key={x} x1={x} y1="205" x2={x} y2="220" strokeWidth="3" />
                ))}
            </g>

            {/* Monitoring station */}
            <g>
                {/* Pole */}
                <rect x="322" y="150" width="7" height="120" rx="3" fill="#1a3963" />
                {/* Sensor box */}
                <rect x="305" y="182" width="30" height="26" rx="5" fill="#24476f" stroke="#3a5f88" strokeWidth="1.5" />
                <rect x="311" y="189" width="10" height="8" rx="2" fill="#38bdf8" opacity="0.8" />
                {/* Solar panel */}
                <g transform="rotate(-18 345 168)">
                    <rect x="335" y="160" width="34" height="20" rx="2" fill="#16345e" stroke="#3a5f88" strokeWidth="1.5" />
                    <line x1="346" y1="160" x2="346" y2="180" stroke="#3a5f88" />
                    <line x1="357" y1="160" x2="357" y2="180" stroke="#3a5f88" />
                </g>
                {/* Wifi */}
                <g stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none">
                    <path d="M318 150 a10 10 0 0 1 18 0" opacity="0.9" />
                    <path d="M313 145 a17 17 0 0 1 28 0" opacity="0.6" />
                </g>
                {/* Measuring gauge in water */}
                <rect x="352" y="214" width="12" height="58" rx="2" fill="#1a3963" stroke="#3a5f88" strokeWidth="1" />
                {[224, 234, 244, 254, 264].map((y) => (
                    <line key={y} x1="352" y1={y} x2="358" y2={y} stroke="#7ba3d6" strokeWidth="1" />
                ))}
            </g>
        </svg>
    );
}
