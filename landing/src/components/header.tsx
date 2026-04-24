import { Button } from "@/components/ui/button";
import { Mail, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "./ui/language-selector";
import { analytics, logEvent, isProduction } from "@/lib/firebaseConfig";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const handleWaitlistClick = (origin: string) => {
    if (isProduction) {
      logEvent(analytics, "click_on_header_join_waitlist", { origin });
    }
    // Scroll to waitlist section
    scrollToSection('waitlist');
  };

  return (
    <header className='fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border'>
      <div className='container max-w-7xl mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <div className='flex items-center gap-3'>
            <button
              onClick={() => scrollToSection('hero')}
              className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center'>
                <Mail className='w-6 h-6 text-primary-foreground' />
              </div>
              <span className='font-bold text-xl'>Replie</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center gap-8'>
            <button
              onClick={() => scrollToSection('features')}
              className='text-muted-foreground hover:text-foreground transition-colors'>
              {t('header.features')}
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className='text-muted-foreground hover:text-foreground transition-colors'>
              {t('header.how_it_works')}
            </button>
            <button
              onClick={() => handleWaitlistClick('menu_desktop')}
              className='text-muted-foreground hover:text-foreground transition-colors'>
              {t('header.waitlist')}
            </button>
          </nav>

          {/* Desktop CTA */}
          <div className='hidden md:flex items-center gap-4'>
            <LanguageSelector className="w-[140px]" />
            <Button
              variant='cta'
              onClick={() => handleWaitlistClick('cta_desktop')}>
              {t('header.waitlist')}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className='md:hidden p-2'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? (
              <X className='w-6 h-6' />
            ) : (
              <Menu className='w-6 h-6' />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden py-4 border-t border-border bg-background/95 backdrop-blur'>
            <nav className='flex flex-col gap-4'>
              <button
                onClick={() => scrollToSection('features')}
                className='text-left text-muted-foreground hover:text-foreground transition-colors py-2'>
                {t('header.features')}
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className='text-left text-muted-foreground hover:text-foreground transition-colors py-2'>
                {t('header.how_it_works')}
              </button>
              <button
                onClick={() => handleWaitlistClick('menu_mobile')}
                className='text-left text-muted-foreground hover:text-foreground transition-colors py-2'>
                {t('header.waitlist')}
              </button>
              <LanguageSelector className="w-full" />
              <Button
                variant='cta'
                className='mt-4'
                onClick={() => handleWaitlistClick('cta_mobile')}>
                {t('header.waitlist')}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};