import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Award, Users, Target, Eye, Sparkles } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Heart,
      title: "Patient-Centered",
      description: "We prioritize patient safety and wellbeing in every product we offer.",
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Rigorous testing and compliance with international healthcare standards.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to delivering the highest quality medical solutions.",
    },
    {
      icon: Users,
      title: "Trusted Partner",
      description: "Building long-term relationships with healthcare professionals worldwide.",
    },
  ];

  const stats = [
    { value: "10+", label: "Years Experience" },
    { value: "500+", label: "Products" },
    { value: "160+", label: "Company Partners" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        <section className="relative bg-gradient-to-br from-[#0d3d2e] via-[#0a5240] to-[#084434] py-28 overflow-hidden">
          <div className="absolute inset-0">
            <Sparkles className="absolute top-20 left-16 h-6 w-6 text-yellow-400/40 animate-pulse" />
            <Sparkles className="absolute bottom-24 right-20 h-5 w-5 text-yellow-400/30 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-36 right-1/4 w-2 h-2 bg-yellow-400/50 rotate-45 animate-float" />
            <div className="absolute bottom-1/3 left-[15%] w-1.5 h-1.5 bg-white/20 rotate-45 animate-float" style={{ animationDelay: '0.5s' }} />
          </div>
          
          <div className="container mx-auto max-w-4xl px-6 text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white animate-fade-in-up">
              About <span className="text-yellow-400">MediPillar</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Your trusted partner in healthcare excellence since our inception. 
              Building bridges between quality healthcare and those who need it most.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <p className="text-4xl md:text-5xl font-bold text-[#0d3d2e] mb-2 group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
                  <p className="text-gray-500 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid md:grid-cols-2 gap-12">
              <Card className="border-0 shadow-lg card-hover bg-white animate-slide-in-left">
                <CardContent className="p-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0d3d2e] to-[#0a5240] flex items-center justify-center mb-6 shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-[#0d3d2e]">Our Mission</h2>
                  <p className="text-gray-600 leading-relaxed">
                    At MediPillar, our mission is to provide healthcare professionals
                    and institutions with premium quality pharmaceutical products and medical
                    supplies. We understand the critical role that reliable medical products
                    play in patient care, which is why we maintain the highest standards of
                    quality, safety, and efficacy in everything we offer.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg card-hover bg-white animate-slide-in-right">
                <CardContent className="p-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0d3d2e] to-[#0a5240] flex items-center justify-center mb-6 shadow-lg">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-[#0d3d2e]">Our Vision</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Through strategic partnerships with leading manufacturers and continuous
                    innovation, we ensure that healthcare providers have access to the most
                    advanced and effective medical solutions available in the market today.
                    We aim to be the most trusted pharmaceutical partner globally.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl font-bold mb-4 text-gradient">Our Core Values</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                These principles guide us in every decision we make and every relationship we build
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card 
                  key={index} 
                  className="group border-0 shadow-lg card-hover bg-white"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0d3d2e] to-[#0a5240] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <value.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-[#0d3d2e]">{value.title}</h3>
                    <p className="text-gray-500">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-[#0d3d2e] via-[#0a5240] to-[#084434] text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <Sparkles className="absolute top-16 right-24 h-6 w-6 text-yellow-400/30 animate-pulse" />
            <div className="absolute bottom-28 left-20 w-2 h-2 bg-yellow-400/40 rotate-45 animate-float" />
          </div>
          
          <div className="container mx-auto max-w-4xl px-6 text-center relative z-10">
            <h2 className="text-4xl font-bold mb-8 animate-fade-in">
              Our <span className="text-yellow-400">Commitment</span>
            </h2>
            <div className="space-y-6 text-lg text-white/80 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <p>
                We are committed to maintaining the trust that healthcare professionals
                place in us. Every product in our catalog undergoes rigorous quality
                control and meets or exceeds international pharmaceutical standards.
              </p>
              <p>
                Our team of experienced professionals works tirelessly to ensure that
                our clients receive not just products, but comprehensive solutions that
                enhance patient care and improve healthcare outcomes.
              </p>
              <p>
                We believe in transparency, integrity, and continuous improvement.
                These principles guide us in every decision we make and every
                relationship we build.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
