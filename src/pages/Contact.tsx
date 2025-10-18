import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';

const Contact = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('contact.messageSent'));
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen gradient-primary p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          className="mb-6 rounded-full hover:scale-105 transition-bounce"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('about.back')}
        </Button>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-card animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-5xl font-black text-foreground mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('contact.subtitle')}
            </p>
          </div>

          <Card className="p-8 border-0 bg-gradient-to-br from-primary/5 to-fun/5">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  {t('contact.name')}
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('contact.namePlaceholder')}
                  required
                  className="rounded-2xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  {t('contact.email')}
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('contact.emailPlaceholder')}
                  required
                  className="rounded-2xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  {t('contact.message')}
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t('contact.messagePlaceholder')}
                  required
                  rows={6}
                  className="rounded-2xl"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-primary text-white border-0 hover:shadow-glow transition-all text-lg py-6 rounded-2xl"
              >
                <Mail className="mr-2 h-5 w-5" />
                {t('contact.send')}
              </Button>
            </form>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              {t('contact.alternative')}
            </p>
            <a 
              href="mailto:support@ailearning.com" 
              className="text-primary font-semibold hover:underline"
            >
              support@ailearning.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
