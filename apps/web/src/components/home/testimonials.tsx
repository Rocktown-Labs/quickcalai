import { Star } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager",
    initials: "SC",
    content:
      "QuickCalAI has revolutionized how I handle meeting schedules. What used to take 15 minutes now takes 15 seconds!",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Entrepreneur",
    initials: "MR",
    content:
      "The accuracy is incredible. It catches dates and times I would have missed manually. Game changer for my business.",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "Executive Assistant",
    initials: "EW",
    content:
      "I process dozens of scheduling requests daily. This tool has made me 10x more efficient. Absolutely essential.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Testimonials
          </p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight">
            Loved by professionals everywhere
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="border-border/50 bg-card/50"
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground/70 mb-5 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">
                      {testimonial.initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
