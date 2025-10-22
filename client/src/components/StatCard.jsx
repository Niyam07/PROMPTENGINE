import { Card, CardContent } from '@/components/ui/card';

// Reusable stat card component
export function StatCard({ title, value, icon: Icon }) {
  return (
    <Card className="border-border/50 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          {/* Icon circle */}
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
