import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  address: string | null;
  avatar_url: string | null;
  theme: string | null;
}

const Settings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    id: '',
    name: '',
    email: '',
    address: '',
    avatar_url: '',
    theme: 'light'
  });

  useEffect(() => {
    checkAuthAndFetchProfile();
  }, []);

  const checkAuthAndFetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          ...data,
          email: session.user.email || data.email // Load email from auth session
        });
        if (data.theme) {
          setTheme(data.theme);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(t('settings.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('settings.fileTooLarge'));
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.invalidFileType'));
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setProfile({ ...profile, avatar_url: base64 });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(t('settings.errorUploadingAvatar'));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          email: profile.email,
          address: profile.address,
          avatar_url: profile.avatar_url,
          theme: theme
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success(t('settings.saved'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('settings.errorSaving'));
    } finally {
      setSaving(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-primary">
        <div className="text-white text-2xl animate-pulse">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-primary p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate('/dashboard')}
          variant="secondary"
          className="mb-6 rounded-full hover:scale-105 transition-bounce"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('about.back')}
        </Button>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-card animate-fade-in">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-foreground">{t('settings.title')}</h1>
              <p className="text-muted-foreground">{t('settings.subtitle')}</p>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-0 bg-gradient-to-br from-primary/5 to-fun/5">
              <h2 className="text-2xl font-bold text-foreground mb-6">{t('settings.personalInfo')}</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-foreground font-semibold">{t('settings.name')}</Label>
                  <Input
                    id="name"
                    value={profile.name || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder={t('settings.namePlaceholder')}
                    className="rounded-2xl mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground font-semibold">{t('settings.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder={t('settings.emailPlaceholder')}
                    className="rounded-2xl mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-foreground font-semibold">{t('settings.address')}</Label>
                  <Textarea
                    id="address"
                    value={profile.address || ''}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder={t('settings.addressPlaceholder')}
                    className="rounded-2xl mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="avatar" className="text-foreground font-semibold">{t('settings.avatar')}</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="rounded-2xl mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t('settings.avatarHelp')}</p>
                  {profile.avatar_url && (
                    <div className="mt-4">
                      <img 
                        src={profile.avatar_url} 
                        alt="Avatar preview" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6 border-0 bg-gradient-to-br from-success/5 to-primary/5">
              <h2 className="text-2xl font-bold text-foreground mb-6">{t('settings.appearance')}</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{t('settings.theme')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.themeDesc')}</p>
                </div>
                <Button
                  onClick={toggleTheme}
                  variant="outline"
                  size="lg"
                  className="rounded-full hover:scale-105 transition-bounce"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="mr-2 h-5 w-5" />
                      {t('settings.lightMode')}
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-5 w-5" />
                      {t('settings.darkMode')}
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full gradient-primary text-white border-0 hover:shadow-glow transition-all text-lg py-6 rounded-2xl"
            >
              {saving ? t('settings.saving') : t('settings.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
