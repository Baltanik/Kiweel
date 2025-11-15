import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsWidgetProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export default function StatsWidget({ title, value, icon: Icon }: StatsWidgetProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="bg-primary/10 p-2 rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Card>
  );
}
