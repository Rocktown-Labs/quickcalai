import { Upload, Zap, Calendar, Download, Shield, Globe } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Smart Upload",
    description:
      "Drag and drop any image — screenshots, photos of whiteboards, PDFs, even handwritten notes with dates.",
  },
  {
    icon: Zap,
    title: "AI Extraction",
    description:
      "Powered by Google Gemini, our AI identifies dates, times, locations, and event names with exceptional accuracy.",
  },
  {
    icon: Calendar,
    title: "Editable Results",
    description:
      "Review extracted events in a clean table. Edit titles, adjust times, or remove entries before exporting.",
  },
  {
    icon: Download,
    title: "Instant Export",
    description:
      "Generate .ics files compatible with Google Calendar, Apple Calendar, Outlook, and every major calendar app.",
  },
  {
    icon: Globe,
    title: "Email & SMS Delivery",
    description:
      "Have your calendar files sent directly to your inbox or phone. Share schedules with your team effortlessly.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description:
      "Your images are processed securely and never stored longer than needed. Your schedule data stays yours.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Features
          </p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight">
            Everything you need for effortless scheduling
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50 rounded-xl overflow-hidden border border-border/50">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-8 bg-background hover:bg-card transition-colors duration-200"
            >
              <feature.icon className="w-5 h-5 text-primary mb-4" />
              <h3 className="text-sm font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
