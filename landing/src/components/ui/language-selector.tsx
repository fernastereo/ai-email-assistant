import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' } 
];

export function LanguageSelector({ className }: { className?: string }) {
  const { i18n } = useTranslation();

  return (
    <Select
      value={i18n.language}
      onValueChange={(value) => i18n.changeLanguage(value)}
    >
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}