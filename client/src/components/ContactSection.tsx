import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Mail, Send, Copy, Check } from "lucide-react";
import { SiFacebook, SiInstagram, SiLinkedin, SiTelegram, SiWhatsapp } from "react-icons/si";
import { useI18n } from "@/hooks/use-i18n";
import { AnimatedSection } from "./AnimatedSection";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
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
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = (data: ContactFormData) => {
    const subject = encodeURIComponent(`Contact from ${data.name}`);
    const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`);
    window.location.href = `mailto:info@ballistiq.xyz?subject=${subject}&body=${body}`;
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("info@ballistiq.xyz");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
    }
  };

  return (
    <section id="contact" className="py-24 sm:py-32" data-testid="section-contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("contact.title1")}{" "}
            <span className="text-primary">{t("contact.title2")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("contact.subtitle")}
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 glass-card">
              <h3 className="text-xl font-semibold text-foreground mb-6">{t("contact.form.title")}</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">{t("contact.form.name")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("contact.form.name.placeholder")}
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
                        <FormLabel className="text-muted-foreground">{t("contact.form.email")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t("contact.form.email.placeholder")}
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
                        <FormLabel className="text-muted-foreground">{t("contact.form.message")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("contact.form.message.placeholder")}
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
                    {t("contact.form.submit")}
                  </Button>
                </form>
              </Form>
            </Card>

            <div className="space-y-6">
              <Card className="p-8 glass-card">
                <h3 className="text-xl font-semibold text-foreground mb-6">{t("contact.info.title")}</h3>
                <div className="flex items-center gap-3">
                  <a
                    href="mailto:info@ballistiq.xyz"
                    className="inline-flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    data-testid="link-email"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-sm">info@ballistiq.xyz</span>
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyEmail}
                    className="text-muted-foreground"
                    aria-label="Copy email"
                    data-testid="button-copy-email"
                  >
                    {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  {copied && (
                    <span className="text-xs text-primary animate-in fade-in">Copied!</span>
                  )}
                </div>
              </Card>

              <Card className="p-8 glass-card">
                <h3 className="text-xl font-semibold text-foreground mb-6">{t("contact.social.title")}</h3>
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
        </AnimatedSection>
      </div>
    </section>
  );
}