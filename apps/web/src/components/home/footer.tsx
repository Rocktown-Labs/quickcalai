import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-card text-card-foreground py-12 border-t border-border">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="grid md:grid-cols-4 gap-8">
               <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <Image src="/QuickCalAI.png" alt="QuickCal Logo" width={32} height={32} className="w-8 h-8 object-contain rounded" />
                    <span className="font-semibold">QuickCalAI</span>
                  </div>
                 <p className="text-muted-foreground">
                   AI-powered calendar extraction that saves you time and eliminates scheduling errors.
                 </p>
               </div>
               <div>
                 <h3 className="font-semibold mb-4">Product</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <a href="#features" className="hover:text-foreground transition-colors">
                        Features
                      </a>
                    </li>
                    <li>
                      <a href="#pricing" className="hover:text-foreground transition-colors">
                        Pricing
                      </a>
                    </li>
                    <li>
                      <a href="/dashboard" className="hover:text-foreground transition-colors">
                        Dashboard
                      </a>
                    </li>
                  </ul>
               </div>
               <div>
                 <h3 className="font-semibold mb-4">Company</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <a href="#hero" className="hover:text-foreground transition-colors">
                        About
                      </a>
                    </li>
                    <li>
                      <a href="https://github.com/Rocktown-Labs/quickcalai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                        GitHub
                      </a>
                    </li>
                    <li>
                      <a href="#contact" className="hover:text-foreground transition-colors">
                        Contact
                      </a>
                    </li>
                  </ul>
               </div>
               <div>
                 <h3 className="font-semibold mb-4">Support</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <a href="#features" className="hover:text-foreground transition-colors">
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a href="#contact" className="hover:text-foreground transition-colors">
                        Contact
                      </a>
                    </li>
                    <li>
                      <a href="/privacy" className="hover:text-foreground transition-colors">
                        Privacy
                      </a>
                    </li>
                  </ul>
               </div>
             </div>
             <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
               <p>&copy; {new Date().getFullYear()} QuickCalAI. All rights reserved.</p>
             </div>
           </div>
         </footer>
  )
}
