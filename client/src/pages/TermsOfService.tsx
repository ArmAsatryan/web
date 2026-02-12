import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageBackground } from "@/components/PageBackground";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ArrowLeft } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";

export function TermsOfServicePage() {
  usePageMeta({
    title: "Terms of Service | BALLISTiQ",
    description:
      "Terms and conditions for using BALLISTiQ ballistic calculator and sniper assistant app. Service description and user responsibilities.",
    path: "/terms-of-service",
  });
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageBackground />
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <article className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Terms and Conditions
            </h1>

            <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
              Introduction
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Welcome to{" "}
              <span className="text-primary font-semibold">BALLISTiQ</span>. These
              Terms and Conditions (&quot;Terms&quot;) govern your use of our mobile
              application. By downloading or using the App, you agree to be bound by
              these Terms.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
              Service Description
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              BALLISTiQ is a ballistic calculator designed to assist users in
              calculating ballistic data for shooting activities. The App is
              user-friendly, easy to use, and integrates with devices such as wind
              meters and rangefinders to enhance functionality.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
              User Responsibilities
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              When using the App, you agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-6">
              <li>Provide accurate and complete information during account creation.</li>
              <li>Use the App in compliance with all applicable laws and regulations.</li>
              <li>
                Not engage in any activity that could harm or disrupt the App or
                other users&apos; experience.
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
              Account Registration
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To use certain features of the App, you must create an account. The
              following information is required for account registration:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
              <li>Name</li>
              <li>Surname</li>
              <li>Email address</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-6">
              There is no minimum age requirement for creating an account. You are
              responsible for maintaining the confidentiality of your account
              information and for all activities that occur under your account.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
              Intellectual Property
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              All content within the App, including text, graphics, logos, and
              software, is the property of BALLISTiQ or its licensors and is
              protected by intellectual property laws. You may not reproduce,
              distribute, or create derivative works from any content within the
              App without our prior written permission.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
              Modifications to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We reserve the right to modify these Terms at any time. If we make
              changes, we will notify you by updating the effective date at the
              top of these Terms and, if the changes are significant, we may provide
              a more prominent notice (such as a notification within the App). Your
              continued use of the App after the changes have been made will
              constitute your acceptance of the revised Terms.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
              Contact Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Email:{" "}
              <a
                href="mailto:support@ballistiq.xyz"
                className="text-primary hover:underline"
              >
                support@ballistiq.xyz
              </a>
            </p>
          </article>
        </div>
      </main>
      <Footer />
      <ScrollProgress />
    </div>
  );
}
