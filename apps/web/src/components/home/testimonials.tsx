import { Star } from "lucide-react";
import  { Card, CardContent } from "../ui/card";

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground mb-4">
                Loved by Thousands of Users
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Chen",
                  role: "Product Manager",
                  content:
                    "QwikCalAI has revolutionized how I handle meeting schedules. What used to take 15 minutes now takes 15 seconds!",
                  rating: 5,
                },
                {
                  name: "Marcus Rodriguez",
                  role: "Entrepreneur",
                  content:
                    "The accuracy is incredible. It catches dates and times I would have missed manually. Game changer for my business.",
                  rating: 5,
                },
                {
                  name: "Emily Watson",
                  role: "Executive Assistant",
                  content:
                    "I process dozens of scheduling requests daily. This tool has made me 10x more efficient. Absolutely essential.",
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <Card key={index} className="border-border shadow-lg bg-card">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-accent fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
  )
}
