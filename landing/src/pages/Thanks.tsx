import { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, Mail, Clock, Users, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WaitlistService } from "@/services/waitlistService";
import { useToast } from "@/hooks/use-toast";
import { analytics, logEvent, isProduction } from "@/lib/firebaseConfig";

interface PaymentData {
  payerId: string;
  transactionId: string;
  amount: string;
  currency: string;
  status: 'completed' | 'failed';
}

interface UserData {
  name: string;
  email: string;
  referralEmail?: string;
}

const Thanks = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      // Extraer PayerID de la URL
      const urlParams = new URLSearchParams(location.search);
      const payerId = urlParams.get('PayerID');

      if (!payerId) {
        console.log('No PayerID found');
        return;
      }

      // Recuperar datos guardados
      const savedData = sessionStorage.getItem('waitlist_user');
      if (!savedData) {
        return;
      }

      try {
        const userData = JSON.parse(savedData) as UserData;

        // Crear objeto de pago
        const payment: PaymentData = {
          payerId,
          transactionId: `txn_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          amount: '1.00',
          currency: 'USD',
          status: 'completed',
        };

        if (isProduction) {
          logEvent(analytics, 'waitlist_payment', {
            value: 1,
            currency: 'USD',
          });
        }
        
        setPaymentData(payment);

        // Actualizar estado de pago en Firebase
        const response =await WaitlistService.updatePaymentStatus(userData.email, {
          payerId: payment.payerId,
          transactionId: payment.transactionId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status
        });

      } catch (error) {
        console.error('Error processing payment:', error);
        toast({
          title: "Error",
          description: "Hubo un problema procesando tu pago. Por favor, contacta a soporte.",
          variant: "destructive",
        });
      }
    };

    processPayment();
  }, [location.search, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 px-4 bg-gradient-subtle">
          <div className="container max-w-4xl mx-auto text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-glow">
              <CheckCircle className="w-12 h-12 text-primary-foreground" />
            </div>

            {/* Main Message */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('thanks.title')}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('thanks.subtitle')}
            </p>

            {/* Payment Details */}
            {paymentData && (
              <div className="bg-card rounded-2xl p-6 mb-8 border border-border shadow-card">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  {t('thanks.payment_details')}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('thanks.transaction_id')}:</span>
                    <span className="ml-2 font-mono text-foreground">{paymentData.payerId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('thanks.status')}:</span>
                    <span className="ml-2 text-green-600 font-semibold">
                      {t('thanks.completed')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('thanks.amount')}:</span>
                    <span className="ml-2 font-semibold text-foreground">${paymentData.amount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('thanks.currency')}:</span>
                    <span className="ml-2 text-foreground">{paymentData.currency}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* Next Steps Section */}
        <section className="py-16 px-4">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              {t('thanks.next_steps_title')}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Mail className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {t('thanks.steps.1.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('thanks.steps.1.description')}
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {t('thanks.steps.2.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('thanks.steps.2.description')}
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {t('thanks.steps.3.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('thanks.steps.3.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Referral Section */}
        <section className="py-16 px-4 bg-gradient-subtle">
          <div className="container max-w-4xl mx-auto text-center">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-elegant">
              <Users className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                {t('thanks.referral_title')}
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                {t('thanks.referral_description')}
              </p>
              <Button size="lg" className="group">
                {t('thanks.share_button')}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              {t('thanks.cta_title')}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t('thanks.cta_description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="hero">
                <Link to="/">
                  {t('thanks.return_home')}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/#features">
                  {t('thanks.learn_more')}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Thanks;
