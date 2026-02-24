import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <button
      className="btn btn-ghost btn-sm"
      onClick={() => i18n.changeLanguage(isHindi ? 'en' : 'hi')}
      title="Switch Language"
      style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing:'0.05em' }}
    >
      {isHindi ? 'EN' : 'हि'}
    </button>
  );
}
