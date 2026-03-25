import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useRoleLabel } from '../hooks/useRoleLabel';
import { LanguageToggle } from '../components/LanguageToggle';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const roleLabel = useRoleLabel(user?.role ?? '');

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold">
                {t('nav.badgeShort')}
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {t('nav.appName')}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <LanguageToggle />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg
                           hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('dashboard.welcome', { name: user.fullName })}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('dashboard.role', { role: roleLabel })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500">
              {t('dashboard.cardRoutingSheets')}
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">—</div>
            <p className="mt-1 text-xs text-gray-400">{t('common.soon')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500">{t('dashboard.cardOperations')}</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">—</div>
            <p className="mt-1 text-xs text-gray-400">{t('common.soon')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500">
              {t('dashboard.cardReferences')}
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">—</div>
            <p className="mt-1 text-xs text-gray-400">{t('common.soon')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
