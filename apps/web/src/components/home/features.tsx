import { Upload, Zap, Calendar, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export default function Features() {
  return (
    <section id="features" className="py-16 bg-card">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
               <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground mb-4">Why Choose QuickCalAI?</h2>
               <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                 Experience the future of calendar management with cutting-edge AI technology
               </p>
             </div>
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 {
                   icon: Upload,
                   title: "Smart Upload",
                   description: "Upload any image with dates and times - screenshots, photos, documents",
                 },
                 {
                   icon: Zap,
                   title: "AI Extraction",
                   description: "Advanced AI instantly identifies and extracts all dates, times, and events",
                 },
                 {
                   icon: Calendar,
                   title: "Editable Results",
                   description: "Review and edit extracted data in an intuitive table format",
                 },
                 {
                   icon: Download,
                   title: "Instant Export",
                   description: "Generate ICS files for email, download, or SMS in one click",
                 },
               ].map((feature, index) => (
                 <Card
                   key={index}
                   className="border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-card"
                 >
                   <CardHeader className="text-center">
                     <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                       <feature.icon className="w-8 h-8 text-primary-foreground" />
                     </div>
                     <CardTitle className="font-serif font-semibold text-xl text-card-foreground">
                       {feature.title}
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-muted-foreground text-center">{feature.description}</p>
                   </CardContent>
                 </Card>
               ))}
             </div>
           </div>
         </section>
  )
}
