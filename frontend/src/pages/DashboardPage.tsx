import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../types/auth';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                МЛ
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Маршрутные листы
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg
                           hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Добро пожаловать, {user.fullName}
          </h1>
          <p className="text-gray-500 mt-1">
            Роль: {roleLabel}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500">
              Маршрутные листы
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">—</div>
            <p className="mt-1 text-xs text-gray-400">Скоро будет доступно</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500">Операции</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">—</div>
            <p className="mt-1 text-xs text-gray-400">Скоро будет доступно</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500">
              Справочники
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">—</div>
            <p className="mt-1 text-xs text-gray-400">Скоро будет доступно</p>
          </div>
        </div>
      </main>
    </div>
  );
}
