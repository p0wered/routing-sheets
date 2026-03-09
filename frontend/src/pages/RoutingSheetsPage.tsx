import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../types/auth';
import {
  getPlanPositions,
  createPlanPosition,
  type PlanPositionListItem,
} from '../api/planPositions';

interface CreatePlanFormState {
  documentNumber: string;
  documentDate: string;
  planningPeriod: string;
}

export default function RoutingSheetsPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreatePlanFormState>(() => {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    return {
      documentNumber: '',
      documentDate: iso,
      planningPeriod: '',
    };
  });
  const [formError, setFormError] = useState<string | null>(null);

  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['planPositions'],
    queryFn: getPlanPositions,
  });

  const createPlanMutation = useMutation({
    mutationFn: async () => {
      setFormError(null);

      const trimmedNumber = createForm.documentNumber.trim();
      if (!trimmedNumber) {
        setFormError('Укажите номер документа');
        throw new Error('validation');
      }

      const payload = {
        documentNumber: trimmedNumber,
        documentDate: createForm.documentDate,
        planningPeriod: createForm.planningPeriod.trim() || null,
        // временные значения для связи с существующей моделью
        positionCode: trimmedNumber,
        name: createForm.planningPeriod.trim() || trimmedNumber,
        productItemId: 1,
        quantityPlanned: 0,
      };

      const created = await createPlanPosition(payload);
      return created;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['planPositions'] });
      setIsCreatePlanOpen(false);
      setSelectedPlanId(created.id);
      setCreateForm((prev) => ({
        ...prev,
        documentNumber: '',
      }));
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: string } };
      if (axiosError.response?.data) {
        setFormError(axiosError.response.data);
      } else if (!formError) {
        setFormError('Не удалось создать план производства');
      }
    },
  });

  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  const selectedPlan: PlanPositionListItem | undefined = plans?.find(
    (p) => p.id === selectedPlanId
  );

  function formatDateRu(dateIso: string) {
    if (!dateIso) return '—';
    const d = new Date(dateIso);
    if (Number.isNaN(d.getTime())) return '—';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    // Исторические/неинициализированные даты (например, 0001-01-01) скрываем
    if (yyyy < 1900) return '—';
    return `${dd}.${mm}.${yyyy}`;
  }

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">
                План производства
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  className="min-w-[260px] px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedPlanId ?? ''}
                  onChange={(e) =>
                    setSelectedPlanId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  disabled={isPlansLoading}
                >
                  <option value="">
                    {isPlansLoading
                      ? 'Загрузка планов...'
                      : 'Выберите план производства'}
                  </option>
                  {plans?.map((plan) => {
                    const dateStr = formatDateRu(plan.documentDate);
                    const label = dateStr !== '—'
                      ? `${plan.name} - ${dateStr}`
                      : plan.name;
                    return (
                      <option key={plan.id} value={plan.id}>
                        {label}
                      </option>
                    );
                  })}
                </select>

                <button
                  type="button"
                  onClick={() => setIsCreatePlanOpen(true)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg
                             hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                             cursor-pointer"
                >
                  Создать план
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600
                           hover:bg-gray-50 cursor-pointer"
                disabled
              >
                Создать маршрутный лист (скоро)
              </button>
              <button
                type="button"
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600
                           hover:bg-gray-50 cursor-pointer"
                disabled
              >
                Добавить операции (скоро)
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {!selectedPlan ? (
            <div className="text-sm text-gray-500">
              Выберите план производства, чтобы увидеть связанные маршрутные
              листы и операции.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedPlan.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatDateRu(selectedPlan.documentDate) !== '—'
                      ? `Дата: ${formatDateRu(selectedPlan.documentDate)}`
                      : ''}
                    {selectedPlan.planningPeriod
                      ? `${formatDateRu(selectedPlan.documentDate) !== '—' ? ' • ' : ''}Период: ${selectedPlan.planningPeriod}`
                      : ''}
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  Блоки маршрутных листов и операций будут реализованы на
                  следующих этапах.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-dashed border-gray-200 rounded-lg p-4 text-sm text-gray-500">
                  Список маршрутных листов для выбранного плана (заглушка).
                </div>
                <div className="border border-dashed border-gray-200 rounded-lg p-4 text-sm text-gray-500">
                  Операции по выбранному маршрутному листу (заглушка).
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {isCreatePlanOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Новый план производства
            </h2>

            <div className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Номер документа
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={createForm.documentNumber}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      documentNumber: e.target.value,
                    }))
                  }
                  placeholder="Например, ПП-2026-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Дата документа
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={createForm.documentDate}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      documentDate: e.target.value,
                    }))
                  }
                />
                <p className="mt-1 text-xs text-gray-400">
                  Хранится без времени, отображается в формате ДД.ММ.ГГГГ.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Период планирования
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={createForm.planningPeriod}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      planningPeriod: e.target.value,
                    }))
                  }
                  placeholder='Например, "Март 2026" или "2 квартал 2026"'
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg
                           hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setIsCreatePlanOpen(false);
                  setFormError(null);
                }}
                disabled={createPlanMutation.isPending}
              >
                Отмена
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg
                           hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                           cursor-pointer disabled:opacity-60"
                onClick={() => createPlanMutation.mutate()}
                disabled={createPlanMutation.isPending}
              >
                {createPlanMutation.isPending ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

