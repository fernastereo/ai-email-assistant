import i18n from "@/lib/i18n";
import { ArrowRight, Download, Mail, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRef, useEffect } from "react";

export const HowItWorksSection = () => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

  const steps = [
    {
      icon: Download,
      title: t('how_it_works.steps.1.title'),
      description: t('how_it_works.steps.1.description')
    },
    {
      icon: Mail,
      title: t('how_it_works.steps.2.title'),
      description: t('how_it_works.steps.2.description')
    },
    {
      icon: Sparkles,
      title: t('how_it_works.steps.3.title'),
      description: t('how_it_works.steps.3.description')
    }
  ];

  // Intersection Observer para controlar la reproducción del video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Función para intentar reproducir el video
    const tryPlay = async () => {
      try {
        await video.play();
      } catch (error) {
        console.log('No se puede reproducir automáticamente:', error);
        // Si falla, agregamos un listener para cuando el usuario haga clic
        const playOnClick = () => {
          video.play();
          video.removeEventListener('click', playOnClick);
        };
        video.addEventListener('click', playOnClick);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video está visible, intentar reproducir
            tryPlay();
          } else {
            // Video no está visible, pausar
            video.pause();
          }
        });
      },
      {
        threshold: 0.5, // Se activa cuando el 50% del video es visible
        rootMargin: '0px'
      }
    );

    observer.observe(video);

    // Cleanup
    return () => {
      observer.unobserve(video);
    };
  }, []);
  return (
    <section className='py-24 px-4'>
      <div className='container max-w-7xl mx-auto'>
        {/* Header */}
        <div className='text-center space-y-4 mb-16'>
          <h2 className='text-3xl md:text-5xl font-bold'>
            {t('how_it_works.title')}{' '}
            <span className='gradient-text'>
              {t('how_it_works.heading_span')}
            </span>
          </h2>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            {t('how_it_works.subtitle')}
          </p>
        </div>

        {/* Steps */}
        <div className='grid md:grid-cols-3 gap-8 lg:gap-12'>
          {steps.map((step, index) => (
            <div
              key={index}
              className='relative text-center group'>
              {/* Step number */}
              <div className='w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-foreground shadow-glow group-hover:scale-110 transition-transform'>
                {index + 1}
              </div>

              {/* Icon */}
              <div className='w-12 h-12 bg-card rounded-xl flex items-center justify-center mx-auto mb-6 shadow-card'>
                <step.icon className='w-6 h-6 text-primary' />
              </div>

              {/* Content */}
              <h3 className='text-xl font-semibold mb-3 text-foreground'>
                {step.title}
              </h3>
              <p className='text-muted-foreground leading-relaxed'>
                {step.description}
              </p>

              {/* Arrow connector (except for last item) */}
              {index < steps.length - 1 && (
                <div className='hidden md:block absolute top-8 -right-6 lg:-right-12'>
                  <ArrowRight className='w-6 h-6 text-muted-foreground' />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Demo section */}
        <div
          id='demo'
          className='mt-20 p-8 bg-gradient-hero rounded-3xl text-center text-primary-foreground'>
          <h3 className='text-2xl font-bold mb-4'>
            {t('how_it_works.video.title')}
          </h3>
          <p className='text-lg mb-6 opacity-90'>
            {t('how_it_works.video.description')}
          </p>
          <div className='w-full max-w-4xl mx-auto h-128 bg-black/20 rounded-2xl flex items-center justify-center overflow-hidden'>
            <div className='w-full h-full flex items-center justify-center'>
              {/* depending on language, show the video en or es */}
              <video
                ref={videoRef}
                src={`/videos/ai_email_assistant_${i18n.language}.mp4`}
                controls
                loop
                muted
                className='w-full h-full object-cover rounded-2xl'
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};