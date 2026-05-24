import { Link } from "wouter";
import { Pill, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-[#0d3d2e] via-[#0a5240] to-[#084434] text-white mt-auto relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-[10%] w-1.5 h-1.5 bg-yellow-400/20 rotate-45" />
        <div className="absolute bottom-40 right-[15%] w-2 h-2 bg-yellow-400/10 rotate-45" />
      </div>
      
      <div className="container mx-auto max-w-7xl px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">MediPillar</span>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              Quality medical solutions you can trust. Your partner in healthcare excellence, providing premium pharmaceutical products.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300 icon-bounce"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4">
                {[
                  { href: "/", label: "Home" },
                  { href: "/about", label: "About Us" },
                  { href: "/products", label: "Our Products" },
                  { href: "/become-partner", label: "Become a Partner" },
                  { href: "/contact", label: "Contact" },
                ].map((link, i) => (

                <li key={i}>
                  <Link 
                    href={link.href} 
                    className="text-white/70 hover:text-yellow-400 transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full group-hover:scale-150 transition-transform duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="font-bold text-lg mb-6">Our Services</h3>
            <ul className="space-y-4">
              {["Injectable Products", "Surgical Range", "Medical Range", "Healthcare Solutions"].map((item, i) => (
                <li key={i} className="text-white/70 flex items-center gap-2 group hover:text-white/90 transition-colors duration-300 cursor-default">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full group-hover:scale-150 transition-transform duration-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              {[
                { icon: Mail, label: "Email us", value: "info@medipillar.com" },
                { icon: Phone, label: "Call us", value: "+1 (555) 123-4567" },
                { icon: MapPin, label: "Visit us", value: "123 Medical St, Healthcare City" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-white/70 group">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                    <item.icon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">{item.label}</p>
                    <p className="text-white group-hover:text-yellow-400 transition-colors duration-300">{item.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/60">
              © {currentYear} MediPillar. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-white/60">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="hover:text-white transition-colors duration-300 link-underline"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
