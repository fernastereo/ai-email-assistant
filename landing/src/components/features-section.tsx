import { Brain, Clock, MessageSquare, Sparkles, Target, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: MessageSquare,
      title: t('features.features.smart_reply.title'),
      description: t('features.features.smart_reply.description'),
    },
    {
      icon: Brain,
      title: t('features.features.tone_detection.title'),
      description: t('features.features.tone_detection.description'),
    },
    {
      icon: Sparkles,
      title: t('features.features.email_summarization.title'),
      description: t('features.features.email_summarization.description'),
    },
    {
      icon: Target,
      title: t('features.features.style_customization.title'),
      description: t('features.features.style_customization.description'),
    },
    {
      icon: Clock,
      title: t('features.features.reply_only_when_needed.title'),
      description: t('features.features.reply_only_when_needed.description'),
    },
    {
      icon: Zap,
      title: t('features.features.one_click_responses.title'),
      description: t('features.features.one_click_responses.description'),
    },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-subtle">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold">
            {t('features.heading')} <span className="gradient-text">
              {t('features.heading_span')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-8 bg-card rounded-2xl shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105 border border-border"
            >
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-4">
            {t('features.footer')}
          </p>
          <div className="flex items-center justify-center gap-8 opacity-60">
            <span className="text-2xl font-semibold">Gmail</span>
            <span className="text-2xl font-semibold">Outlook</span>
          </div>
        </div>
      </div>
    </section>
  );
};