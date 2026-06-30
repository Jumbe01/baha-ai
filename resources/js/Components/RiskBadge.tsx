import { Badge } from '@/Components/ui/badge';

interface RiskBadgeProps {
    risk: { level: string; label: string };
}

export default function RiskBadge({ risk }: RiskBadgeProps) {
    const variant =
        risk.level === 'critical'
            ? 'destructive'
            : risk.level === 'warning'
              ? 'warning'
              : risk.level === 'safe'
                ? 'success'
                : 'secondary';

    return <Badge variant={variant}>{risk.label}</Badge>;
}
