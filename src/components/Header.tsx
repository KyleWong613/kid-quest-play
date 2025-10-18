import { useTranslation } from 'react-i18next';
import { Globe, LogOut, LogIn, Home, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Header = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const languages = [
    { code: 'en', name: 'EN', flag: '🇬🇧' },
    { code: 'ms', name: 'MS', flag: '🇲🇾' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ta', name: 'த', flag: '🇮🇳' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <nav className="flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-semibold"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">{t('nav.home')}</span>
          </Link>
          
          {user && (
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-semibold"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="hidden sm:inline">{t('nav.dashboard')}</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select value={i18n.language} onValueChange={changeLanguage}>
              <SelectTrigger className="w-[100px] border-0 focus:ring-0 h-9 bg-transparent">
                <SelectValue>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{currentLanguage.flag}</span>
                    <span className="text-sm">{currentLanguage.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 z-[100]">
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {user ? (
            <>
              <Button
                onClick={() => navigate('/settings')}
                variant="ghost"
                size="sm"
                className="rounded-full hover:scale-105 transition-bounce"
              >
                <SettingsIcon className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSignOut}
                variant="secondary"
                size="sm"
                className="rounded-full hover:scale-105 transition-bounce"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('dashboard.signOut')}</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate('/auth')}
              variant="default"
              size="sm"
              className="rounded-full hover:scale-105 transition-bounce gradient-primary text-white border-0"
            >
              <LogIn className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t('auth.signIn')}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

