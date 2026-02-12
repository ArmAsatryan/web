import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-3">
            <Logo size="sm" />
            <p className="text-white/30 text-xs">
              &copy; {new Date().getFullYear()} BALLISTiQ. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors" data-testid="link-privacy">
              Privacy Policy
            </a>
            <span className="text-white/10">|</span>
            <a href="#" className="hover:text-white/60 transition-colors" data-testid="link-terms">
              Terms of Service
            </a>
            <span className="text-white/10">|</span>
            <a href="#features" className="hover:text-white/60 transition-colors" data-testid="link-footer-features">
              Features
            </a>
            <span className="text-white/10">|</span>
            <a href="#contact" className="hover:text-white/60 transition-colors" data-testid="link-footer-contact">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}