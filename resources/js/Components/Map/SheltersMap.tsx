import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface ShelterPoint {
    id: number;
    name: string;
    barangay: string;
    latitude: number | string;
    longitude: number | string;
    capacity: number;
    spaces_remaining: number;
    status: string;
    distance_km?: number | null;
}

interface SheltersMapProps {
    centers: ShelterPoint[];
    userLocation: { lat: number; lng: number } | null;
}

const STATUS_COLOR: Record<string, string> = {
    open: '#16a34a',
    full: '#ea580c',
    closed: '#dc2626',
};

const CONSOLACION = { lat: 10.3667, lng: 123.9567 };

export default function SheltersMap({ centers, userLocation }: SheltersMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) {
            return;
        }

        const origin = userLocation ?? CONSOLACION;

        const map = new maplibregl.Map({
            container: containerRef.current,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: 'raster',
                        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '© OpenStreetMap contributors',
                    },
                },
                layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
            },
            center: [origin.lng, origin.lat],
            zoom: 13,
        });

        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

        map.on('load', () => {
            const bounds = new maplibregl.LngLatBounds();

            centers.forEach((center) => {
                const lng = Number(center.longitude);
                const lat = Number(center.latitude);

                if (Number.isNaN(lng) || Number.isNaN(lat)) {
                    return;
                }

                const el = document.createElement('div');
                el.style.cssText = [
                    'width:18px',
                    'height:18px',
                    'border-radius:9999px',
                    'border:3px solid #ffffff',
                    'box-shadow:0 1px 4px rgba(0,0,0,.4)',
                    `background:${STATUS_COLOR[center.status] ?? '#64748b'}`,
                ].join(';');

                const distance =
                    center.distance_km !== undefined && center.distance_km !== null
                        ? `<div style="color:#475569">${center.distance_km} km away</div>`
                        : '';

                new maplibregl.Marker({ element: el })
                    .setLngLat([lng, lat])
                    .setPopup(
                        new maplibregl.Popup({ offset: 14 }).setHTML(
                            `<div style="font-family:system-ui;font-size:12px;line-height:1.5">
                                <div style="font-weight:700;color:#0b3c5d">${center.name}</div>
                                <div style="color:#475569">${center.barangay}</div>
                                <div style="margin-top:4px">${center.spaces_remaining} of ${center.capacity} spaces free</div>
                                ${distance}
                            </div>`,
                        ),
                    )
                    .addTo(map);

                bounds.extend([lng, lat]);
            });

            if (userLocation) {
                const el = document.createElement('div');
                el.style.cssText =
                    'width:14px;height:14px;border-radius:9999px;border:3px solid #ffffff;background:#2563eb;box-shadow:0 1px 4px rgba(0,0,0,.4)';

                new maplibregl.Marker({ element: el })
                    .setLngLat([userLocation.lng, userLocation.lat])
                    .setPopup(new maplibregl.Popup({ offset: 12 }).setHTML('<b>You are here</b>'))
                    .addTo(map);

                bounds.extend([userLocation.lng, userLocation.lat]);
            }

            if (!bounds.isEmpty()) {
                map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
            }
        });

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [centers, userLocation]);

    return <div ref={containerRef} className="h-80 w-full overflow-hidden rounded-xl" />;
}
