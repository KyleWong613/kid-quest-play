import { useTranslation } from 'react-i18next';
import { Sparkles, Target } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gradient-to-r from-primary to-primary/80 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6" />
              <h3 className="text-2xl font-bold">{t('footer.vision')}</h3>
            </div>
            <p className="text-white/90 text-lg leading-relaxed">
              {t('footer.visionText')}
            </p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6" />
              <h3 className="text-2xl font-bold">{t('footer.scope')}</h3>
            </div>
            <p className="text-white/90 text-lg leading-relaxed">
              {t('footer.scopeText')}
            </p>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-6 text-center">
          <p className="text-white/80">
            © {new Date().getFullYear()} AI Learning Platform. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
