import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Mail, Send } from "lucide-react";
import { SiFacebook, SiInstagram, SiLinkedin, SiTelegram, SiWhatsapp } from "react-icons/si";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().min(1, "Message is required"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const socialLinks = [
  { name: "Facebook", url: "https://facebook.com/ballistiq", Icon: SiFacebook },
  { name: "Instagram", url: "https://instagram.com/ballistiq", Icon: SiInstagram },
  { name: "LinkedIn", url: "https://linkedin.com/company/ballistiq", Icon: SiLinkedin },
  { name: "Telegram", url: "https://t.me/ballistiq", Icon: SiTelegram },
  { name: "WhatsApp", url: "https://wa.me/ballistiq", Icon: SiWhatsapp },
];

export function ContactSection() {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = (data: ContactFormData) => {
    const subject = encodeURIComponent(`Contact from ${data.name}`);
    const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`);
    window.location.href = `mailto:info@ballistiq.xyz?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="py-24 sm:py-32" data-testid="section-contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Get in <span className="text-[rgb(0,151,178)]">Touch</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Have questions or interested in B2B integration? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="p-8 bg-card border-card-border">
            <h3 className="text-xl font-semibold text-white mb-6">Send a Message</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/60">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your name"
                          data-testid="input-name"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/60">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/60">Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your message..."
                          rows={4}
                          className="resize-none"
                          data-testid="input-message"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" data-testid="button-send">
                  <Send className="w-4 h-4" />
                  Send Message
                </Button>
              </form>
            </Form>
          </Card>

          <div className="space-y-6">
            <Card className="p-8 bg-card border-card-border">
              <h3 className="text-xl font-semibold text-white mb-6">Contact Info</h3>
              <a
                href="mailto:info@ballistiq.xyz"
                className="inline-flex items-center gap-3 text-white/70 hover:text-[rgb(0,151,178)] transition-colors"
                data-testid="link-email"
              >
                <Mail className="w-5 h-5" />
                <span className="text-sm">info@ballistiq.xyz</span>
              </a>
            </Card>

            <Card className="p-8 bg-card border-card-border">
              <h3 className="text-xl font-semibold text-white mb-6">Follow Us</h3>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map(({ name, url, Icon }) => (
                  <Button
                    key={name}
                    asChild
                    variant="ghost"
                    size="icon"
                    aria-label={name}
                    data-testid={`link-social-${name.toLowerCase()}`}
                  >
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <Icon className="w-4 h-4" />
                    </a>
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}