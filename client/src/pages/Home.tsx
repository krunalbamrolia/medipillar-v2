import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CompanyTable } from "@/components/CompanyTable";
import { CompanyLogoTicker } from "@/components/CompanyLogoTicker";
import { getCompanyLogoUrl } from "@/lib/companyLogo";
import { Star, ArrowRight, Building2, Headphones, BookOpen, Award, Sparkles } from "lucide-react";
const heroImage =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80";
import type { Company } from "@shared/types/catalog";

export default function Home() {
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: statsData, isLoading: isLoadingStats } = useQuery<{
    companies: number;
    medicines: number;
    orders: number;
    categories: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const activeCompanies = companies.filter((c) => c.status === "active");
  const featuredCompanies = activeCompanies.slice(0, 10);

  const reasons = [
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Our dedicated team is always available to assist you with any queries or concerns around the clock.",
    },
    {
      icon: BookOpen,
      title: "Top Guide",
      description: "Comprehensive guidance and expertise in pharmaceutical products to help you make informed decisions.",
    },
    {
      icon: Award,
      title: "Best Quality",
      description: "Premium quality products meeting the highest standards of safety and efficacy in the industry.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Choose Best Product For You",
      description: "Browse through our extensive catalog of pharmaceutical products tailored to your needs.",
    },
    {
      number: "02",
      title: "Active Learning Engagement",
      description: "Learn about product specifications, usage guidelines, and expert recommendations.",
    },
    {
      number: "03",
      title: "Connect With Suppliers",
      description: "Get in touch with trusted pharmaceutical companies for procurement and partnerships.",
    },
  ];

  const stats = [
    { value: isLoadingStats ? "..." : `${statsData?.companies ?? 0}`, label: "Company Partners" },
    { value: isLoadingStats ? "..." : `${statsData?.medicines ?? 0}`, label: "Medicines Available" },
    { value: isLoadingStats ? "..." : `${statsData?.orders ?? 0}`, label: "Orders Placed" },
  ];

  const reviews = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      rating: 5,
      text: "MediPillar has been our trusted partner for years. Their product quality and reliability are unmatched in the industry.",
      date: "2 weeks ago",
    },
    {
      id: 2,
      name: "Michael Chen",
      rating: 5,
      text: "Exceptional service and high-quality medical supplies. The team is always responsive and professional.",
      date: "1 month ago",
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      rating: 5,
      text: "Outstanding pharmaceutical products with excellent documentation. MediPillar sets the standard for medical excellence.",
      date: "3 weeks ago",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#0d3d2e] via-[#0a5240] to-[#084434] pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-[10%] w-2 h-2 bg-yellow-400 rotate-45 animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-32 right-[15%] w-3 h-3 bg-yellow-400/60 rotate-45 animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-40 left-[20%] w-2 h-2 bg-yellow-400/40 rotate-45 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-[5%] w-1.5 h-1.5 bg-white/30 rotate-45 animate-float" style={{ animationDelay: '1.5s' }} />
          <Sparkles className="absolute top-28 left-16 h-6 w-6 text-yellow-400/50 animate-pulse" />
          <Sparkles className="absolute bottom-32 right-24 h-5 w-5 text-yellow-400/40 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto max-w-7xl px-6 py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-6 animate-fade-in-up">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-white/80">5.0 Star | 1.2M+ Reviews</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="animate-slide-in-left inline-block">Because Health</span><br />
                <span className="animate-slide-in-left inline-block" style={{ animationDelay: '0.15s' }}>Is Complicated</span><br />
                <span className="text-yellow-400 animate-slide-in-left inline-block" style={{ animationDelay: '0.3s' }}>Enough.</span>
              </h1>

              <p className="text-lg text-white/80 mb-8 max-w-xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                Find quality pharmaceutical products easily. Build your healthcare network
                with MediPillar - your trusted partner in medical excellence.
              </p>

              <div className="flex flex-wrap gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <Link href="/products">
                  <Button
                    size="lg"
                    className="bg-white text-[#0d3d2e] hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 btn-shine hover:scale-105"
                  >
                    Explore Products
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:border-white/50 hover:scale-105"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-10 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                {stats.map((stat, index) => (
                  <div key={index} className="text-center group">
                    <p className="text-3xl md:text-4xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">{stat.value}</p>
                    <p className="text-sm text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 to-teal-400/20 rounded-3xl blur-3xl animate-pulse" />
                <div className="relative rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl hover-lift">
                  <img
                    src={heroImage}
                    alt="Healthcare Professional"
                    className="w-full h-[520px] object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-2xl animate-float hover-scale" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0d3d2e] to-[#0a5240] rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#0d3d2e]">{statsData?.companies}+</p>
                      <p className="text-sm text-gray-500">Trusted Partners</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {activeCompanies.length > 0 && (
        <CompanyLogoTicker companies={activeCompanies} />
      )}

      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">3 Reasons To Choose Us</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Discover why healthcare professionals trust MediPillar for their pharmaceutical needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {reasons.map((reason, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-0 shadow-lg card-hover bg-white"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <CardContent className="p-8 text-center relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#0d3d2e] to-[#0a5240] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                    <reason.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800">{reason.title}</h3>
                  <p className="text-gray-500 mb-6">{reason.description}</p>
                  <Link href="/about">
                    <Button variant="ghost" className="text-[#0d3d2e] font-semibold group-hover:gap-3 transition-all duration-300">
                      Read More <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-br from-[#0d3d2e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-[#0d3d2e] via-[#0a5240] to-[#084434] text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <Sparkles className="absolute top-20 left-12 h-6 w-6 text-yellow-400/30 animate-pulse" />
          <Sparkles className="absolute bottom-20 right-12 h-5 w-5 text-yellow-400/30 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-40 right-1/4 w-2 h-2 bg-yellow-400/40 rotate-45 animate-float" />
          <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-white/20 rotate-45 animate-float" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-in-left">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Follow These 3 Simple Steps to<br />
                <span className="text-yellow-400">Join Our Network!</span>
              </h2>

              <div className="space-y-8 mt-12">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-6 group cursor-pointer">
                    <div className="flex-shrink-0">
                      <span className="text-5xl font-bold text-white/20 group-hover:text-yellow-400/50 transition-all duration-500">
                        {step.number}
                      </span>
                    </div>
                    <div className="transform group-hover:translate-x-2 transition-transform duration-300">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-400 transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block animate-slide-in-right">
              <div className="relative rounded-3xl overflow-hidden hover-lift">
                <img
                  src={heroImage}
                  alt="Healthcare Professional"
                  className="w-full h-[500px] object-cover rounded-3xl transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d3d2e]/60 to-transparent" />
              </div>

              <div className="absolute top-8 right-8 glass-effect rounded-2xl p-4 animate-float hover-scale">
                <p className="text-3xl font-bold">{isLoadingStats ? "..." : statsData?.companies ?? 0}</p>
                <p className="text-sm text-white/70">Companies</p>
              </div>
              <div className="absolute top-1/3 right-4 glass-effect rounded-2xl p-4 animate-float hover-scale" style={{ animationDelay: '0.5s' }}>
                <p className="text-3xl font-bold">{isLoadingStats ? "..." : statsData?.medicines ?? 0}</p>
                <p className="text-sm text-white/70">Medicines</p>
              </div>
              <div className="absolute bottom-1/3 right-8 glass-effect rounded-2xl p-4 animate-float hover-scale" style={{ animationDelay: '1s' }}>
                <p className="text-3xl font-bold">{isLoadingStats ? "..." : statsData?.orders ?? 0}</p>
                <p className="text-sm text-white/70">Orders Placed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 animate-fade-in">
            <div>
              <h2 className="text-4xl font-bold mb-2 text-gray-800">Our Popular Companies For You</h2>
              <p className="text-gray-500">Explore our trusted pharmaceutical partners</p>
            </div>
            <Link href="/products?view=companies">
              <Button size="lg" className="mt-4 md:mt-0 bg-gradient-to-r from-[#0d3d2e] to-[#0a5240] hover:shadow-xl transition-all duration-300 btn-shine hover:scale-105" data-testid="button-view-all-companies">
                View All Companies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="transition-all duration-300">
            <CompanyTable
              companies={featuredCompanies}
              isLoading={isLoadingCompanies}
            />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-3 text-gray-800">What Our Clients Say</h2>
            <p className="text-lg text-gray-500">Trusted by healthcare professionals worldwide</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, idx) => (
              <Card
                key={review.id}
                className="border-0 shadow-lg card-hover bg-white"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 transition-all duration-300 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-base text-gray-600 mb-6 leading-relaxed line-clamp-4">
                    "{review.text}"
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <p className="font-semibold text-gray-800">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.date}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
