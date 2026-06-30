<?php

namespace App\Services;

use App\Models\FloodIncident;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExportService
{
    /**
     * Stream flood incidents within a date range as a CSV download.
     */
    public function incidentsCsv(?string $from, ?string $to): StreamedResponse
    {
        $incidents = $this->incidentsQuery($from, $to);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="flood-incidents.csv"',
        ];

        return response()->streamDownload(function () use ($incidents) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Date', 'Zone', 'Barangay', 'Severity', 'Peak Level (m)', 'Rainfall (mm)', 'Duration (min)', 'Affected Residents']);

            foreach ($incidents as $incident) {
                fputcsv($out, [
                    $incident->occurred_at->format('Y-m-d H:i'),
                    $incident->floodZone->name,
                    $incident->floodZone->barangay,
                    $incident->severity,
                    $incident->peak_water_level,
                    $incident->total_rainfall,
                    $incident->duration_minutes,
                    $incident->affected_residents,
                ]);
            }

            fclose($out);
        }, 'flood-incidents.csv', $headers);
    }

    /**
     * Render flood incidents within a date range as a PDF download.
     */
    public function incidentsPdf(?string $from, ?string $to): Response
    {
        $incidents = $this->incidentsQuery($from, $to);

        $pdf = Pdf::loadView('reports.flood-incidents', [
            'incidents' => $incidents,
            'from' => $from,
            'to' => $to,
            'generatedAt' => now(),
        ]);

        return $pdf->download('flood-incidents.pdf');
    }

    /**
     * @return Collection<int, FloodIncident>
     */
    private function incidentsQuery(?string $from, ?string $to): Collection
    {
        return FloodIncident::with('floodZone:id,name,barangay')
            ->when($from, fn ($q) => $q->where('occurred_at', '>=', $from))
            ->when($to, fn ($q) => $q->where('occurred_at', '<=', $to.' 23:59:59'))
            ->orderBy('occurred_at', 'desc')
            ->get();
    }
}
