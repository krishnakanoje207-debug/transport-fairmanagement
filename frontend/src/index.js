import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './i18n/en.json';
import hiTranslations from './i18n/hi.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
