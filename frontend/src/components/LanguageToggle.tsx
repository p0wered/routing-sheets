import { useTranslation } from 'react-i18next';

export function LanguageToggle() {
  const { i18n, t } = useTranslation();

  function setLang(lng: string) {
    void i18n.changeLanguage(lng);
  }

  return (
    <div
      className="w-full p-1 flex rounded-lg bg-secondary overflow-hidden text-[13px] font-semibold"
      title={t('nav.language')}
    >
      <button
        type="button"
        className={`w-full px-2.5 py-2 rounded-md transition cursor-pointer ${
          i18n.language.startsWith('ru')
            ? 'bg-white text-primary'
            : 'text-gray-600 hover:bg-gray-200/50'
        }`}
        onClick={() => setLang('ru')}
      >
        RU
      </button>
      <button
        type="button"
        className={`w-full px-2.5 py-2 rounded-lg transition cursor-pointer ${
          i18n.language.startsWith('en')
            ? 'bg-white text-primary'
            : 'text-gray-600 hover:bg-gray-200/50'
        }`}
        onClick={() => setLang('en')}
      >
        EN
      </button>
    </div>
  );
}
