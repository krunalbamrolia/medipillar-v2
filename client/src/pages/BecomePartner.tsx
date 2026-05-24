import { motion, useScroll, useSpring, useInView } from "framer-motion";
import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Store,
  TableProperties,
  Pill,
  Users,
  LineChart,
  Award,
  ArrowRight,
  HandshakeIcon,
  CheckCircle2,
  TrendingUp,
  Shield,
  Clock,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  Target,
  Heart,
  Zap,
} from "lucide-react";
import { createPartnerWhatsAppLink } from "@/lib/whatsapp";

const roadmapItems = [
  {
    step: "01",
    title: "Initial Consultation",
    description: "We begin with a detailed discussion about your goals, location preferences, and investment capacity. Our experts assess your requirements and create a personalized roadmap for success.",
    icon: HandshakeIcon,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    step: "02",
    title: "Store Setup & Infrastructure",
    description: "We provide complete guidance for pharmacy store setup including optimal layout planning, modern counters, medicine racks, and display units designed for maximum efficiency.",
    icon: Store,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
  },
  {
    step: "03",
    title: "Equipment & Technology",
    description: "Get access to state-of-the-art pharmacy equipment, billing software, inventory management systems, and digital tools to streamline your operations.",
    icon: TableProperties,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-500/10",
  },
  {
    step: "04",
    title: "Medicine Inventory Supply",
    description: "Access our extensive network of genuine medicines from top pharmaceutical companies. Enjoy competitive margins, reliable supply chains, and exclusive deals.",
    icon: Pill,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10",
  },
  {
    step: "05",
    title: "Staff Training & Support",
    description: "Comprehensive training programs for your staff covering inventory management, customer service, regulatory compliance, and digital operations.",
    icon: Users,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-500/10",
  },
  {
    step: "06",
    title: "Launch & Growth",
    description: "Marketing support, promotional campaigns, and data-driven insights to help you attract customers and scale your pharmacy business profitably.",
    icon: LineChart,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-500/10",
  },
  {
    step: "07",
    title: "Certified Partner Status",
    description: "Become a recognized Medipillar Certified Partner, gaining customer trust, brand recognition, and exclusive benefits in the healthcare ecosystem.",
    icon: Award,
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-500/10",
  },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "High Profit Margins",
    description: "Enjoy industry-leading margins with our direct manufacturer partnerships",
  },
  {
    icon: Shield,
    title: "100% Genuine Products",
    description: "All medicines are sourced directly from authorized distributors",
  },
  {
    icon: Clock,
    title: "Quick Setup",
    description: "Get your pharmacy operational within 30-45 days of agreement",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    description: "24/7 support team to assist with any operational challenges",
  },
  {
    icon: Zap,
    title: "Technology Enabled",
    description: "Modern POS systems and inventory management software included",
  },
  {
    icon: Heart,
    title: "Community Impact",
    description: "Serve your community with quality healthcare products",
  },
];

const stats = [
  { value: "500+", label: "Partner Stores" },
  { value: "50K+", label: "Products Available" },
  { value: "98%", label: "Partner Satisfaction" },
  { value: "24/7", label: "Support Available" },
];

const AnimatedSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const RoadMapItem = ({ item, index }: { item: typeof roadmapItems[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className="relative mb-12 md:mb-0">
      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-primary/50 to-transparent" />
      
      <div className={`flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
        <motion.div
          initial={{ opacity: 0, x: isEven ? -50 : 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? -50 : 50 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full md:w-5/12"
        >
          <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
            <CardContent className="p-6">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${item.bgColor} mb-4`}>
                <item.icon className={`h-6 w-6 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`} style={{ color: item.color.includes('blue') ? '#3b82f6' : item.color.includes('purple') ? '#a855f7' : item.color.includes('indigo') ? '#6366f1' : item.color.includes('green') ? '#22c55e' : item.color.includes('orange') ? '#f97316' : item.color.includes('red') ? '#ef4444' : '#eab308' }} />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-4xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                  {item.step}
                </span>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30"
        >
          <item.icon className="h-8 w-8 text-white" />
        </motion.div>

        <div className="hidden md:block w-5/12" />
      </div>
    </div>
  );
};

export default function BecomePartner() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const link = createPartnerWhatsAppLink(formData);
    window.open(link, "_blank");
    setIsDialogOpen(false);
    setFormData({ name: "", email: "", phone: "", age: "" });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX }}
      />

      <main className="relative overflow-hidden">
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="mb-6 px-6 py-2 text-sm font-medium text-primary border-primary/30 bg-primary/5">
                <Sparkles className="h-4 w-4 mr-2" />
                Partnership Opportunity
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/70">
                  Build Your Healthcare
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary/70 via-primary/90 to-primary">
                  Business With Us
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                Join Medipillar's trusted network of pharmacy partners. We provide everything you need 
                to start and grow a successful healthcare business - from store setup to ongoing support.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-primary/30 transition-all group"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-full px-8 py-6 text-lg"
                  onClick={() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-1">
                <Target className="h-3 w-3 mr-2" />
                Why Choose Us
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Benefits of Partnership
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover why hundreds of entrepreneurs have chosen to partner with Medipillar
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 group">
                    <CardContent className="p-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="roadmap" className="py-20 px-4 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-1">
                <MapPin className="h-3 w-3 mr-2" />
                Partnership Journey
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Your Road to Success
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Follow our proven step-by-step process to launch your pharmacy business
              </p>
            </AnimatedSection>

            <div className="space-y-8 md:space-y-16">
              {roadmapItems.map((item, index) => (
                <RoadMapItem key={index} item={item} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-1">
                <CheckCircle2 className="h-3 w-3 mr-2" />
                What We Provide
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Complete Business Package
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to run a successful pharmacy business
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "Store Infrastructure",
                  items: [
                    "Modern store layout design",
                    "Custom medicine racks and shelves",
                    "Display counters and tables",
                    "Signage and branding materials",
                    "Air conditioning guidelines",
                    "Security system recommendations",
                  ],
                },
                {
                  title: "Technology Solutions",
                  items: [
                    "Point of Sale (POS) software",
                    "Inventory management system",
                    "Billing and accounting software",
                    "Customer relationship management",
                    "Online ordering integration",
                    "Analytics and reporting tools",
                  ],
                },
                {
                  title: "Medicine Supply",
                  items: [
                    "50,000+ medicine varieties",
                    "Direct manufacturer sourcing",
                    "Competitive wholesale pricing",
                    "Regular stock replenishment",
                    "Express delivery service",
                    "Return and exchange policy",
                  ],
                },
                {
                  title: "Training & Support",
                  items: [
                    "Staff training programs",
                    "Regulatory compliance guidance",
                    "Marketing and promotion support",
                    "24/7 helpdesk assistance",
                    "Regular business reviews",
                    "Networking opportunities",
                  ],
                },
              ].map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 text-primary">
                        {section.title}
                      </h3>
                      <ul className="space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-4 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-8">
                <HandshakeIcon className="h-10 w-10 text-primary" />
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Start Your Journey?
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Take the first step towards owning a successful pharmacy business. 
                Join our network of 500+ partners and make a difference in your community's healthcare.
              </p>
              
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-12 py-8 text-xl rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300"
                onClick={() => setIsDialogOpen(true)}
              >
                <HandshakeIcon className="mr-3 h-6 w-6" />
                I'm Interested in Becoming a Partner
              </Button>
              
              <p className="mt-6 text-sm text-muted-foreground">
                No commitment required. Let's discuss your opportunity.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Get in Touch
              </h2>
              <p className="text-muted-foreground">
                Have questions? Reach out to our partnership team.
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Phone, label: "Call Us", value: "+91 88760 58876" },
                { icon: Mail, label: "Email Us", value: "partners@medipillar.com" },
                { icon: MapPin, label: "Visit Us", value: "Mumbai, Maharashtra" },
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="text-center hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                        <contact.icon className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{contact.label}</p>
                      <p className="font-semibold">{contact.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <HandshakeIcon className="text-primary h-6 w-6" />
              Partner Registration
            </DialogTitle>
            <DialogDescription>
              Please provide your details below. Our team will contact you within 24 hours to discuss the partnership opportunity.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age (Optional)</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full py-6 text-lg font-semibold mt-4">
              Send Partnership Request
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
