import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Sparkles, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import heroIllustration from "@/assets/hero-illustration.png";
import { analytics, logEvent, isProduction } from "@/lib/firebaseConfig";

export const HeroSection = () => {
  const { t } = useTranslation();
  const handleWaitlistClick = () => {
    if (isProduction) {
      logEvent(analytics, "click_on_hero_join_waitlist", {});
    }
    // Scroll to waitlist section
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDemoClick = () => {
    if (isProduction) {
      logEvent(analytics, "click_on_hero_demo", {});
    }
    // Scroll to demo section
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id='hero'
      className='relative min-h-screen flex items-center justify-center px-0 md:px-4 pt-20 pb-16 overflow-hidden'>
      {/* Background gradient */}
      <div className='absolute inset-0 bg-gradient-subtle' />

      {/* Floating elements */}
      <div className='absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-float' />
      <div
        className='absolute top-40 right-20 w-16 h-16 bg-accent/10 rounded-full animate-float'
        style={{ animationDelay: '2s' }}
      />
      <div
        className='absolute bottom-40 left-20 w-12 h-12 bg-primary/10 rounded-full animate-float'
        style={{ animationDelay: '4s' }}
      />

      <div className='container max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center relative z-10'>
        {/* Content */}
        <div className='space-y-8 text-center lg:text-left'>
          {/* Badge */}
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium animate-pulse-glow'>
            <Sparkles className='w-4 h-4' />
            {t('hero.heading')}
          </div>

          {/* Headline */}
          <div className='space-y-4'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight'>
              {t('hero.title')}
            </h1>
            <p className='text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed'>
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Features list */}
          <div className='space-y-3'>
            <div className='flex items-center gap-3 justify-center lg:justify-start'>
              <div className='w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center'>
                <Zap className='w-3 h-3 text-primary-foreground' />
              </div>
              <span className='text-foreground font-medium'>
                {t('hero.feature1')}
              </span>
            </div>
            <div className='flex items-center gap-3 justify-center lg:justify-start'>
              <div className='w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center'>
                <Mail className='w-3 h-3 text-primary-foreground' />
              </div>
              <span className='text-foreground font-medium'>
                {t('hero.feature2')}
              </span>
            </div>
            <div className='flex items-center gap-3 justify-center lg:justify-start'>
              <div className='w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center'>
                <Sparkles className='w-3 h-3 text-primary-foreground' />
              </div>
              <span className='text-foreground font-medium'>
                {t('hero.feature3')}
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
            <Button
              variant='hero'
              size='xl'
              onClick={handleWaitlistClick}
              className='group'>
              {t('hero.cta')}
              <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
            </Button>
            <Button
              variant='outline'
              size='xl'
              onClick={handleDemoClick}>
              {t('hero.cta2')}
            </Button>
          </div>

          {/* Social proof */}
          <div className='flex items-center gap-4 justify-center lg:justify-start text-sm text-muted-foreground'>
            <div className='flex -space-x-2'>
              <div className='w-8 h-8 bg-gradient-primary rounded-full' />
              <div className='w-8 h-8 bg-gradient-accent rounded-full' />
              <div className='w-8 h-8 bg-gradient-primary rounded-full' />
            </div>
            <span>{t('hero.early_users')}</span>
          </div>
        </div>

        {/* Illustration */}
        <div className='relative flex justify-center lg:justify-end'>
          <div className='relative'>
            <img
              src={heroIllustration}
              alt='Replie Illustration'
              className='w-full max-w-lg h-auto animate-float'
            />
            <div className='absolute inset-0 bg-gradient-hero opacity-20 rounded-3xl blur-3xl' />
          </div>
        </div>
      </div>
    </section>
  );
};