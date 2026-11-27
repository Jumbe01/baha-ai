import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { statusStyle } from '@/lib/status';
import { el } from '@/lib/dom';

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
    open: statusStyle('safe').hex,
    full: '#ea580c', // not a risk level; darker orange than warning
    closed: statusStyle('critical').hex,
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

                const markerEl = document.createElement('div');
                markerEl.style.cssText = [
                    'width:18px',
                    'height:18px',
                    'border-radius:9999px',
                    'border:3px solid #ffffff',
                    'box-shadow:0 1px 4px rgba(0,0,0,.4)',
                    `background:${STATUS_COLOR[center.status] ?? statusStyle('neutral').hex}`,
                ].join(';');

                const popup = el('div', 'font-family:system-ui;font-size:12px;line-height:1.5', null, [
                    el('div', 'font-weight:700;color:#0b3c5d', center.name),
                    el('div', 'color:#475569', center.barangay),
                    el('div', 'margin-top:4px', `${center.spaces_remaining} of ${center.capacity} spaces free`),
                ]);
                if (center.distance_km !== undefined && center.distance_km !== null) {
                    popup.appendChild(el('div', 'color:#475569', `${center.distance_km} km away`));
                }

                new maplibregl.Marker({ element: markerEl })
                    .setLngLat([lng, lat])
                    .setPopup(new maplibregl.Popup({ offset: 14 }).setDOMContent(popup))
                    .addTo(map);

                bounds.extend([lng, lat]);
            });

            if (userLocation) {
                const youEl = document.createElement('div');
                youEl.style.cssText = `width:14px;height:14px;border-radius:9999px;border:3px solid #ffffff;background:${statusStyle('info').hex};box-shadow:0 1px 4px rgba(0,0,0,.4)`;

                new maplibregl.Marker({ element: youEl })
                    .setLngLat([userLocation.lng, userLocation.lat])
                    .setPopup(new maplibregl.Popup({ offset: 12 }).setDOMContent(el('b', '', 'You are here')))
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
