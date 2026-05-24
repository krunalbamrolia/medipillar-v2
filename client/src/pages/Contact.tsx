import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send, Clock, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertMessageSchema, type InsertMessage } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function Contact() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<InsertMessage>({
    resolver: zodResolver(insertMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        message: form.getValues("message") || "",
      });
    }
  }, [user, form]);

  const submitMutation = useMutation({
    mutationFn: (data: InsertMessage) =>
      apiRequest("POST", "/api/messages", data),
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    },
  });

  const onSubmit = (data: InsertMessage) => {
    submitMutation.mutate(data);
  };

  const contactInfo = [
    { icon: Mail, title: "Email Us", lines: ["info@medipillar.com", "support@medipillar.com"] },
    { icon: Phone, title: "Call Us", lines: ["+1 (555) 123-4567", "+1 (555) 987-6543"] },
    { icon: MapPin, title: "Visit Us", lines: ["123 Medical Street", "Healthcare City, HC 12345"] },
    { icon: Clock, title: "Working Hours", lines: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM"] },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        <section className="relative bg-gradient-to-br from-[#0d3d2e] via-[#0a5240] to-[#084434] py-24 overflow-hidden">
          <div className="absolute inset-0">
            <Sparkles className="absolute top-20 left-16 h-6 w-6 text-yellow-400/40 animate-pulse" />
            <Sparkles className="absolute bottom-20 right-24 h-5 w-5 text-yellow-400/30 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-32 right-1/3 w-2 h-2 bg-yellow-400/50 rotate-45 animate-float" />
          </div>
          
          <div className="container mx-auto max-w-4xl px-6 text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white animate-fade-in-up">
              Get In <span className="text-yellow-400">Touch</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="animate-slide-in-left">
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl text-[#0d3d2e]">Send us a message</CardTitle>
                    <p className="text-gray-500">Fill out the form below and we'll get back to you shortly.</p>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your name"
                                  className="h-12 border-2 focus:border-[#0d3d2e] transition-all duration-300"
                                  data-testid="input-contact-name"
                                  disabled={!!user}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="your@email.com"
                                  className="h-12 border-2 focus:border-[#0d3d2e] transition-all duration-300"
                                  data-testid="input-contact-email"
                                  disabled={!!user}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">Phone</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  placeholder="Your phone number"
                                  className="h-12 border-2 focus:border-[#0d3d2e] transition-all duration-300"
                                  data-testid="input-contact-phone"
                                  disabled={!!user}
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="How can we help you?"
                                  className="min-h-32 resize-none border-2 focus:border-[#0d3d2e] transition-all duration-300"
                                  data-testid="input-contact-message"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-[#0d3d2e] to-[#0a5240] text-lg font-semibold btn-shine hover:scale-[1.02] transition-all duration-300"
                          disabled={submitMutation.isPending}
                          data-testid="button-send-message"
                        >
                          {submitMutation.isPending ? (
                            "Sending..."
                          ) : (
                            <>
                              <Send className="mr-2 h-5 w-5" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8 animate-slide-in-right">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contactInfo.map((info, index) => (
                    <Card 
                      key={index} 
                      className="border-0 shadow-lg card-hover bg-white"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0d3d2e] to-[#0a5240] flex items-center justify-center flex-shrink-0 shadow-lg">
                            <info.icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-[#0d3d2e] mb-2">{info.title}</h3>
                            {info.lines.map((line, i) => {
                              const isPhone = line.startsWith("+1");
                              const isEmail = line.includes("@");
                              if (isPhone) {
                                return <a key={i} href={`tel:${line.replace(/[^0-9+]/g, '')}`} className="block text-sm text-[#0d3d2e] hover:underline font-medium mb-1">{line}</a>;
                              }
                              if (isEmail) {
                                return <a key={i} href={`mailto:${line}`} className="block text-sm text-[#0d3d2e] hover:underline font-medium mb-1">{line}</a>;
                              }
                              return <p key={i} className="text-sm text-gray-600 mb-1">{line}</p>;
                            })}
                            {info.title === "Call Us" && (
                              <a href="https://wa.me/15551234567" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 text-sm text-green-600 font-semibold hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-full transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.056 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
                                Chat on WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="overflow-hidden border-0 shadow-xl hover-lift">
                  <div className="w-full h-72">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2176766252386!2d-73.98784368459395!3d40.74844097932847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Office Location"
                    />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
