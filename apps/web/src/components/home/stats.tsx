import { Calendar, Users, Zap, Clock } from "lucide-react";

const stats = [
  { label: "Events Extracted", value: "10,000+", icon: Calendar },
  { label: "Happy Users", value: "500+", icon: Users },
  { label: "Accuracy Rate", value: "99.2%", icon: Zap },
  { label: "Avg. Processing", value: "<3s", icon: Clock },
];

export default function Stats() {
  return (
    <section className="py-14 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center space-y-1">
              <stat.icon className="w-4 h-4 text-primary mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
