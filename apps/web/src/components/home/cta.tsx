import { Zap } from "lucide-react";
import {Button} from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
export default function CTA() {
  return (
    <section className="py-16 bg-primary">
           <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
             <h2 className="font-serif font-bold text-3xl md:text-4xl text-primary-foreground mb-4">
               Ready to Transform Your Scheduling?
             </h2>
             <p className="text-xl text-primary-foreground/90 mb-8">
               Join thousands of professionals who've already revolutionized their calendar management
             </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignUpButton>
                  <Button
                    size="lg"
                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-8 py-4"
                  >
                    Start Your Free Trial
                    <Zap className="ml-2 w-5 h-5" />
                  </Button>
                </SignUpButton>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-4 bg-transparent"
                  asChild
                >
                  <a href="#contact">Schedule Demo</a>
                </Button>
              </div>
             <p className="text-primary-foreground/80 text-sm mt-4">
               No credit card required • 14-day free trial • Cancel anytime
             </p>
           </div>
         </section>
  )
}
