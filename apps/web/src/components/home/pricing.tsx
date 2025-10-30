import  { CheckCircle, Badge } from "lucide-react";
import  { Button } from "../ui/button";
import  { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
              <div className="text-center mb-16">
                <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground mb-4">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-xl text-muted-foreground">Choose the plan that fits your scheduling needs</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Starter Plan */}
                <Card className="border-2 border-border hover:border-primary transition-colors bg-card">
                  <CardHeader className="text-center">
                    <CardTitle className="font-serif font-semibold text-2xl text-card-foreground">Starter</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">$5</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <CardDescription>Perfect for occasional use</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-card-foreground">Up to 50 images per month</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-card-foreground">AI date extraction</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-card-foreground">ICS file generation</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-card-foreground">Email support</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6 bg-transparent" variant="outline">
                      Start Free Trial
                    </Button>
                  </CardContent>
                </Card>

                {/* Pro Plan */}
                <Card className="border-2 border-primary relative overflow-hidden bg-card">
                  <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-3 py-1 text-sm font-semibold">
                    Most Popular
                  </div>
                  <CardHeader className="text-center">
                    <CardTitle className="font-serif font-semibold text-2xl text-card-foreground">Pro</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">$10.99</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <CardDescription>For power users and professionals</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-card-foreground">Unlimited images</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-card-foreground">Calendar integrations</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-card-foreground">Auto-sync to calendars</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-card-foreground">Priority support</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-card-foreground">Advanced editing tools</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                      Start Free Trial
                    </Button>
                  </CardContent>
                </Card>

                {/* Annual Plan */}
                <Card className="border-2 border-border hover:border-primary transition-colors bg-card">
                  <CardHeader className="text-center">
                    <CardTitle className="font-serif font-semibold text-2xl text-card-foreground">Annual</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">$50</span>
                      <span className="text-muted-foreground">/year</span>
                    </div>
                    <CardDescription>
                      <Badge className="bg-green-100 text-green-800">Save 62%</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-card-foreground">Everything in Pro</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-card-foreground">2 months free</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-card-foreground">Premium integrations</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-card-foreground">White-label options</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6 bg-transparent" variant="outline">
                      Start Free Trial
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
           )
}
