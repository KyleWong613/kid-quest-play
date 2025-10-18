import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Header = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-end items-center">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-muted-foreground" />
          <Select value={i18n.language} onValueChange={changeLanguage}>
            <SelectTrigger className="w-[180px] border-0 focus:ring-0">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span>{currentLanguage.flag}</span>
                  <span>{currentLanguage.name}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
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
      </div>
    </header>
  );
};

export default Header;
