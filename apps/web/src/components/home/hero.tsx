import { Badge, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function Hero() {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="animate-slide-up">
                <Badge className="mb-4 bg-accent/20 text-accent-foreground border-accent/30">
                  🚀 AI-Powered Scheduling Revolution
                </Badge>
                <h1 className="font-serif font-bold text-4xl md:text-6xl text-foreground mb-6 leading-tight">
                  Transform Your Scheduling Experience with <span className="text-primary">QwikCalAI</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Extract, organize, and optimize your calendar instantly. Upload any image with dates and times, let our
                  AI do the work, and get perfect calendar files in seconds.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow text-lg px-8 py-4"
                  >
                    Start Your Free Trial Today
                    <Zap className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-4 bg-transparent"
                  >
                    Watch Demo
                  </Button>
                </div>
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    No credit card required
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Setup in 30 seconds
                  </div>
                </div>
              </div>
              <div className="relative animate-float">
                <div className="relative z-10">
                  <img
                    src="/placeholder.svg?height=500&width=600"
                    alt="QwikCalAI Interface"
                    className="rounded-2xl shadow-2xl"
                  />
                </div>
                <div className="absolute -top-4 -right-4 w-full h-full bg-primary/20 rounded-2xl blur-xl"></div>
              </div>
            </div>
          </div>
        </section>
  )
}
