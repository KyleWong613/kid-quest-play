import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gradient-to-r from-primary to-primary/80 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/80 text-center md:text-left">
            © {new Date().getFullYear()} AI Learning Platform. {t('footer.rights')}.
          </p>
          
          <div className="flex gap-6">
            <Link 
              to="/about" 
              className="text-white hover:text-white/80 transition-colors font-medium"
            >
              {t('footer.about')}
            </Link>
            <Link 
              to="/contact" 
              className="text-white hover:text-white/80 transition-colors font-medium"
            >
              {t('contact.title')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

