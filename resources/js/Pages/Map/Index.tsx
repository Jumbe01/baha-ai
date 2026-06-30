import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FloodMap from '@/Components/Map/FloodMap';
import MapLegend from '@/Components/Map/MapLegend';
import { Head } from '@inertiajs/react';

interface Props {
    center: { lat: number; lng: number };
}

export default function Index({ center }: Props) {
    return (
        <AuthenticatedLayout header="Flood Map">
            <Head title="Flood Map" />

            <div className="relative h-[calc(100vh-9rem)] overflow-hidden rounded-lg border border-gray-200">
                <FloodMap
                    center={center}
                    geojsonUrl="/api/map/geojson"
                    sensorsUrl="/api/map/sensors"
                />
                <MapLegend />
            </div>
        </AuthenticatedLayout>
    );
}
