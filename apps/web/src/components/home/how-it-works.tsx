import { Upload, Sparkles, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your image",
    description:
      "Snap a photo or upload a screenshot of any schedule — class timetables, event flyers, meeting agendas, sports calendars.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI extracts events",
    description:
      "Our AI instantly identifies every date, time, location, and event name. Review and edit the results in a clean table view.",
  },
  {
    number: "03",
    icon: Download,
    title: "Export & sync",
    description:
      "Download your .ics file, or have it delivered straight to your inbox or phone via email and SMS. One click to your calendar.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            How it works
          </p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight">
            Three steps to a perfect calendar
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative max-w-4xl mx-auto">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-8 left-[25%] right-[25%] h-px section-divider" aria-hidden="true" />

          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="inline-flex flex-col items-center mb-6">
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground/40 uppercase mb-2">
                  Step {step.number}
                </span>
                <div className="w-14 h-14 rounded-xl bg-card border border-border flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-base font-semibold mb-2 text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
