import { useTranslation } from 'react-i18next';
import { Sparkles, Target, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-primary p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          className="mb-6 rounded-full hover:scale-105 transition-bounce"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-card animate-fade-in">
          <h1 className="text-5xl font-black text-foreground mb-8 text-center">
            {t('footer.about')}
          </h1>

          <div className="space-y-12">
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">{t('footer.vision')}</h2>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed pl-15">
                {t('footer.visionText')}
              </p>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-success" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">{t('footer.scope')}</h2>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed pl-15">
                {t('footer.scopeText')}
              </p>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-fun/10 rounded-2xl p-8 mt-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-2xl font-bold text-foreground mb-4">Why We're Different</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <span className="text-lg">AI-powered personalized learning experiences</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🎮</span>
                  <span className="text-lg">Gamified storytelling that makes learning fun</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🌍</span>
                  <span className="text-lg">Multi-language support for global accessibility</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🏆</span>
                  <span className="text-lg">Rewards and certificates to motivate learners</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
