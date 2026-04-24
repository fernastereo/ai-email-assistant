import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Mail, Star, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { WaitlistService } from "@/services/waitlistService";
import { analytics, logEvent, isProduction } from "@/lib/firebaseConfig";

export const WaitlistSection = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const ONE_DOLLAR = 'TPMJZCCD5B89Y'
  const TEN_DOLLARS = 'A45FDJVXC4MH4'

  const validateForm = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return false;
    }

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to continue.",
        variant: "destructive",
      });
      return false;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleWaitlist = async () => {
    if (!validateForm()) {
      return;
    }

    //log event only in production
    if (isProduction) {
      logEvent(analytics, "click_join_waitlist", {
          email: email.trim(),
          name: name.trim(),
        });
    }

    setIsLoading(true);

    try {
      // 1. Verificar si el usuario existe
      const userExists = await WaitlistService.userExists(email.trim());
      
      if (!userExists) {
        // 2. Si no existe, lo guardamos
        const userId = await WaitlistService.saveUser({
          name: name.trim(),
          email: email.trim(),
        });

        if (userId) {
          //clean fields
          setEmail("");
          setName("");
          toast({
            title: "User saved",
            description: "User saved in waitlist. Thanks for your support!!.",
            variant: "default",
          });
        }
      }else{
        toast({
          title: "User already exists",
          description: "User already exists in waitlist. Thanks for your support!!.",
          variant: "default",
        });
        return;
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="waitlist" className="py-24 px-4 bg-gradient-subtle">
      <div className="container max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-6 mb-12">
            <h2 className="text-3xl md:text-5xl font-bold">
              {t('waitlist.title')} <span className="gradient-text">
                {t('waitlist.heading_span')}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('waitlist.description')}
            </p>
          </div>

          {/* Pricing Card */}
          <div className="bg-card rounded-3xl shadow-elegant border border-border overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-hero text-primary-foreground p-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4">
                <Star className="w-4 h-4" />
                Early Access
              </div>
              <h3 className="text-2xl font-bold mb-2">{t('waitlist.card.title')}</h3>
              <p className="opacity-90">{t('waitlist.card.description')}</p>
            </div>

            {/* Features */}
            <div className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>{t('waitlist.features.3.title')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>{t('waitlist.features.4.title')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>{t('waitlist.features.5.title')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>{t('waitlist.features.6.title')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>{t('waitlist.features.7.title')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>{t('waitlist.features.8.title')}</span>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold text-center text-foreground mb-4">
                  {t('waitlist.form.title')}
                </h3>
                {/* Name Field */}
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t('waitlist.form.name_placeholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-12 h-12 text-base"
                  />
                </div>

                {/* Email Field */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={t('waitlist.form.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 text-base"
                  />
                </div>
                
                <div className="flex flex-col items-center gap-4">
                  <Button
                    onClick={handleWaitlist}
                    disabled={isLoading || !name || !email}
                    className="w-full max-w-md h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {t('waitlist.join')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="text-center mt-12 space-y-4">
            <p className="text-muted-foreground">Trusted by professionals worldwide</p>
          </div>
        </div>
      </div>
    </section>
  );
};