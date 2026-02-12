import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageBackground } from "@/components/PageBackground";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ArrowLeft } from "lucide-react";

export function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>

            <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
              Introduction
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Thank you for choosing{" "}
              <span className="text-primary font-semibold">BALLISTiQ</span>. This
              Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our mobile application.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
              Information We Collect
            </h2>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-2">
              Personal Data
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We collect personal identification information from you when you
              create an account on our App. This information includes:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-6">
              <li>Name</li>
              <li>Surname</li>
              <li>Email address</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-2">
              Usage Data
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use Firebase to collect non-personal information about your use of
              the App. This data may include:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-6">
              <li>Device type</li>
              <li>Operating system version</li>
              <li>IP address</li>
              <li>App usage statistics</li>
              <li>Crash logs</li>
              <li>Unique device identifiers</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-2">
              Location Data
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We collect location data to provide certain features within the App.
              You have the ability to enable or disable location services through
              your device settings.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
              Use of Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We may use the information collected from you in the following ways:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-6">
              <li>To create and manage your account</li>
              <li>To improve the App and your experience</li>
              <li>To respond to customer service requests and support needs</li>
              <li>
                To monitor and analyze usage and trends to improve your experience
                with the App
              </li>
              <li>To detect, prevent, and address technical issues</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
              Disclosure of Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We do not sell, trade, or otherwise transfer your information to
              outside parties. We use trusted third-party services (e.g., Firebase)
              to assist us in operating the App. These third parties are obligated
              to keep your information confidential and secure.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
              Data Security
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We use administrative, technical, and physical security measures to
              help protect your personal information. While we have taken
              reasonable steps to secure the personal information you provide to us,
              please be aware that despite our efforts, no security measures are
              perfect or impenetrable.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
              Your Data Protection Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-3">
              <li>
                <strong className="text-foreground">The right to access</strong> –
                You have the right to request copies of your personal data.
              </li>
              <li>
                <strong className="text-foreground">The right to rectification</strong> –
                You have the right to request that we correct any information you
                believe is inaccurate or complete information you believe is
                incomplete.
              </li>
              <li>
                <strong className="text-foreground">The right to erasure</strong> –
                You have the right to request that we erase your personal data,
                under certain conditions.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-6">
              You can access, update, or delete your personal data directly from
              your profile page within the App.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
              Changes to This Privacy Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page. You
              are advised to review this Privacy Policy periodically for any
              changes.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              If you have any questions about this Privacy Policy, please contact
              us at:
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
