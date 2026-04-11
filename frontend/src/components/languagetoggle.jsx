import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const isHindi = i18n.language?.startsWith('hi');

  const toggle = () => {
    const newLang = isHindi ? 'en' : 'hi';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
    document.documentElement.lang = newLang;
  };

  return (
    <button className="btn btn-ghost btn-sm" onClick={toggle} title="Switch Language"
      style={{ fontWeight: 700, letterSpacing: '.04em', minWidth: 48 }}>
      {isHindi ? 'EN' : 'हिं'}
    </button>
  );
}
