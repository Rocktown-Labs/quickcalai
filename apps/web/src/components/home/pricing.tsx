"use client";

import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { SignUpButton } from "@clerk/nextjs";
import posthog from "posthog-js";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Get started with manual tools",
    featured: false,
    features: [
      "Manual calendar automation",
      "Manual file creation",
      "Files delivered via downloads",
    ],
  },
  {
    name: "Premium",
    price: "$12.99",
    period: "/mo",
    description: "AI-powered calendar automation",
    featured: true,
    features: [
      "Everything in Free",
      "Unlimited AI extractions",
      "Files delivered via email",
      "Files delivered via SMS",
      "Calendar integration",
    ],
  },
  {
    name: "Annual",
    price: "$71.88",
    period: "/yr",
    description: "Save 45% with annual billing",
    featured: false,
    features: [
      "Everything in Premium",
      "2 months free",
      "Premium integrations",
      "White-label options",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Pricing
          </p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose the plan that fits your needs. Upgrade or cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto items-start">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative transition-all duration-200 ${
                plan.featured
                  ? "border-primary/40 shadow-lg shadow-primary/5 bg-card"
                  : "border-border/50 bg-card/50 hover:border-border"
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
              )}

              <CardHeader className="text-center pb-2">
                {plan.featured && (
                  <span className="inline-block mx-auto mb-2 px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded bg-primary/10 text-primary">
                    Popular
                  </span>
                )}
                <CardTitle className="text-lg font-semibold text-foreground">
                  {plan.name}
                </CardTitle>
                <div className="mt-3 mb-1">
                  <span className="text-3xl font-bold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  )}
                </div>
                <CardDescription className="text-xs">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-4">
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground/70">{feature}</span>
                    </li>
                  ))}
                </ul>
                <SignUpButton>
                  <Button
                    className={`w-full text-sm ${
                      plan.featured
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-transparent"
                    }`}
                    variant={plan.featured ? "default" : "outline"}
                    size="sm"
                    onClick={() => posthog.capture('sign_up_clicked', { source: 'pricing', plan: plan.name.toLowerCase() })}
                  >
                    Get Started
                  </Button>
                </SignUpButton>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
