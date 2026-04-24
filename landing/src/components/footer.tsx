import { Mail, Twitter, Github, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TermsOfService } from "@/components/ui/terms-of-service";
import { useState } from "react";

export const Footer = () => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <footer className="bg-card border-t border-border py-12 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Replie</span>
            </div>
            <p className="text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('footer.product.title')}</h3>
            <div className="space-y-2">
              <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">{t('footer.product.features')}</a>
              <a href="#how-it-works" className="block text-muted-foreground hover:text-foreground transition-colors">{t('footer.product.how_it_works')}</a>
              <a href="#waitlist" className="block text-muted-foreground hover:text-foreground transition-colors">{t('footer.product.waitlist')}</a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">{t('footer.product.demo')}</a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('footer.support.title')}</h3>
            <div className="space-y-2">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">{t('footer.support.help_center')}</a>
              <a href="/docs/privacy-policy.pdf" className="block text-muted-foreground hover:text-foreground transition-colors">{t('footer.support.privacy_policy')}</a>
              <a href="mailto:support@replie.email" className="block text-muted-foreground hover:text-foreground transition-colors">{t('footer.support.contact')}</a>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('footer.connect.title')}</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="mailto:support@replie.email" className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2025 Replie. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="/docs/privacy-policy.pdf" className="hover:text-foreground transition-colors">{t('footer.support.privacy_policy')}</a>
            <button 
              onClick={() => setIsTermsOpen(true)}
              className="hover:text-foreground transition-colors"
            >
              {t('footer.support.terms_of_service')}
            </button>
            <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};