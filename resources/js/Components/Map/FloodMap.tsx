import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { riskToStatus, statusStyle } from '@/lib/status';
import { el } from '@/lib/dom';

interface FloodMapProps {
    center: { lat: number; lng: number };
    geojsonUrl: string;
    sensorsUrl: string;
}

const RISK_FILL_COLOR: maplibregl.ExpressionSpecification = [
    'match',
    ['get', 'risk'],
    'critical', statusStyle('critical').hex,
    'high', statusStyle('critical').hex,
    'warning', statusStyle('warning').hex,
    'moderate', statusStyle('moderate').hex,
    'safe', statusStyle('safe').hex,
    'normal', statusStyle('safe').hex,
    statusStyle('neutral').hex,
];

export default function FloodMap({ center, geojsonUrl, sensorsUrl }: FloodMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const popupRef = useRef<maplibregl.Popup | null>(null);

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

        map.on('load', async () => {
            // Flood zone polygons
            map.addSource('flood-zones', { type: 'geojson', data: geojsonUrl });

            map.addLayer({
                id: 'flood-zones-fill',
                type: 'fill',
                source: 'flood-zones',
                paint: {
                    'fill-color': RISK_FILL_COLOR,
                    'fill-opacity': 0.5,
                },
            });

            map.addLayer({
                id: 'flood-zones-outline',
                type: 'line',
                source: 'flood-zones',
                paint: {
                    'line-color': 'rgba(255,255,255,0.6)',
                    'line-width': 1.5,
                },
            });

            // Sensor points
            map.addSource('sensors', { type: 'geojson', data: sensorsUrl });

            map.addLayer({
                id: 'sensors-circle',
                type: 'circle',
                source: 'sensors',
                paint: {
                    'circle-radius': 7,
                    'circle-color': RISK_FILL_COLOR,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff',
                },
            });

            map.on('click', 'sensors-circle', (e) => {
                const feature = e.features?.[0];
                if (!feature) {
                    return;
                }

                const props = feature.properties as Record<string, string>;
                const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];

                const riskColor = statusStyle(riskToStatus(props.risk)).hex;

                const content = el('div', 'font-family: system-ui; min-width: 180px;', null, [
                    el('div', 'font-weight: 600; font-size: 14px; margin-bottom: 4px;', props.name),
                    el('div', 'font-size: 12px; color: #6b7280; margin-bottom: 6px;', `${props.flood_zone} · ${props.barangay}`),
                    el('div', 'display: flex; align-items: center; gap: 6px; margin-bottom: 4px;', null, [
                        el('span', `background: ${riskColor}; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;`, props.risk),
                        el('span', 'font-size: 16px; font-weight: 700;', `${Number(props.water_level).toFixed(2)}m`),
                    ]),
                ]);

                popupRef.current?.remove();
                popupRef.current = new maplibregl.Popup({ closeButton: true })
                    .setLngLat(coords)
                    .setDOMContent(content)
                    .addTo(map);
            });

            map.on('mouseenter', 'sensors-circle', () => {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'sensors-circle', () => {
                map.getCanvas().style.cursor = '';
            });
        });

        return () => {
            popupRef.current?.remove();
            map.remove();
            mapRef.current = null;
        };
    }, [center.lat, center.lng, geojsonUrl, sensorsUrl]);

    return <div ref={containerRef} className="h-full w-full" />;
}
