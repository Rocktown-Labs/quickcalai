import Logo from "../logo";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Dashboard", href: "/dashboard" },
];

const companyLinks = [
  { label: "About", href: "#hero" },
  { label: "GitHub", href: "https://github.com/Rocktown-Labs/quickcalai", external: true },
  { label: "Contact", href: "mailto:support@quickcalai.com" },
];

const supportLinks = [
  { label: "Help Center", href: "mailto:support@quickcalai.com" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Logo size={20} className="text-primary" />
              <span className="text-sm font-semibold tracking-tight">QuickCalAI</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              AI-powered calendar extraction that saves you time and eliminates scheduling errors.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-sm text-foreground/60 hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">
              Support
            </h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} QuickCalAI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Built by Rocktown Labs
          </p>
        </div>
      </div>
    </footer>
  );
}
