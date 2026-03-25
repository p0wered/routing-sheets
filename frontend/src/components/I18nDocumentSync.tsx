import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function I18nDocumentSync() {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language.startsWith('en') ? 'en' : 'ru';
    document.title = t('app.title');
  }, [i18n.language, t]);

  return null;
}
