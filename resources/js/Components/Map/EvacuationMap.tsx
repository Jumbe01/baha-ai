import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface FloodedZone {
    id: number;
    name: string;
    barangay: string;
    risk: string;
    water_level: number;
    center: { lat: number; lng: number };
    evacuation_route: { lat: number; lng: number }[];
}

interface EvacuationMapProps {
    center: { lat: number; lng: number };
    floodedZones: FloodedZone[];
    evacuationCenter: { lat: number; lng: number; name: string };
}

export default function EvacuationMap({ center, floodedZones, evacuationCenter }: EvacuationMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) {
            return;
        }

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
            center: [center.lng, center.lat],
            zoom: 13,
        });

        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

        map.on('load', () => {
            // Evacuation routes (lines from flooded zones to evacuation center)
            const routeFeatures = floodedZones.map((zone) => ({
                type: 'Feature' as const,
                properties: { name: zone.name },
                geometry: {
                    type: 'LineString' as const,
                    coordinates: zone.evacuation_route.map((p) => [p.lng, p.lat]),
                },
            }));

            map.addSource('routes', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: routeFeatures },
            });

            map.addLayer({
                id: 'routes-line',
                type: 'line',
                source: 'routes',
                paint: {
                    'line-color': '#2563eb',
                    'line-width': 3,
                    'line-dasharray': [2, 1],
                },
            });

            // Flooded zone markers
            floodedZones.forEach((zone) => {
                const color = zone.risk === 'critical' ? '#ef4444' : '#eab308';
                const el = document.createElement('div');
                el.style.cssText = `width:18px;height:18px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 0 0 2px ${color};`;

                new maplibregl.Marker({ element: el })
                    .setLngLat([zone.center.lng, zone.center.lat])
                    .setPopup(
                        new maplibregl.Popup().setHTML(`
                            <div style="font-family: system-ui; min-width: 160px;">
                                <div style="font-weight:600;font-size:13px;">${zone.name}</div>
                                <div style="font-size:11px;color:#6b7280;">${zone.barangay}</div>
                                <div style="margin-top:4px;font-size:13px;font-weight:700;">${zone.water_level}m</div>
                            </div>
                        `)
                    )
                    .addTo(map);
            });

            // Evacuation center marker (green)
            const evacEl = document.createElement('div');
            evacEl.style.cssText = 'width:22px;height:22px;border-radius:4px;background:#16a34a;border:3px solid white;box-shadow:0 0 0 2px #16a34a;';
            new maplibregl.Marker({ element: evacEl })
                .setLngLat([evacuationCenter.lng, evacuationCenter.lat])
                .setPopup(
                    new maplibregl.Popup().setHTML(`
                        <div style="font-family: system-ui;">
                            <div style="font-weight:600;font-size:13px;">🏛️ Evacuation Center</div>
                            <div style="font-size:11px;color:#6b7280;">${evacuationCenter.name}</div>
                        </div>
                    `)
                )
                .addTo(map);
        });

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [center.lat, center.lng, floodedZones, evacuationCenter]);

    return <div ref={containerRef} className="h-full w-full" />;
}
