import { Badge } from '@/Components/ui/badge';

export default function AlertSeverityBadge({ severity }: { severity: string }) {
    const variant = severity === 'critical' ? 'destructive' : 'warning';

    return <Badge variant={variant}>{severity.charAt(0).toUpperCase() + severity.slice(1)}</Badge>;
}
