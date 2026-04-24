import { useTranslation } from "react-i18next";

export const Differentiation = () => {
  const { t } = useTranslation();

  return (
    <section className='pt-0 pb-24 px-4 bg-gradient-subtle'>
      <div className='container max-w-7xl mx-auto text-center'>
        <h2 className='text-3xl md:text-5xl font-bold mb-6'>
          {t('differentiation.heading')} <span className='gradient-text'>{t('differentiation.heading_span')}</span>
        </h2>
        <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
          {t('differentiation.subtitle')}
        </p>
      </div>
    </section>  
  );
};