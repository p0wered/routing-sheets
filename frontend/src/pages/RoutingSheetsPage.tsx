import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../types/auth';
import type { CreatePlanFormState } from '../types/plan';
import { Button } from '../components/Button';
import { RoutingHeader } from '../components/Header';
import { Select } from '../components/DropdownSelector';
import { CreatePlanModal } from '../components/CreatePlanModal';
import {
  getPlanPositions,
  createPlanPosition,
  type PlanPositionListItem,
} from '../api/planPositions';
import { Plus, FileText, ListPlus } from 'lucide-react';

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

      const payload = {
        documentNumber: trimmedNumber,
        documentDate: createForm.documentDate,
        planningPeriod: createForm.planningPeriod.trim() || null,
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
      } else {
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
      <RoutingHeader user={user} roleLabel={roleLabel} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <section className="bg-white rounded-3xl shadow-lg/5 border border-gray-200 p-3 mb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={selectedPlanId}
                onChange={setSelectedPlanId}
                options={
                  plans?.map((plan) => {
                    const dateStr = formatDateRu(plan.documentDate);
                    const label =
                      dateStr !== '—'
                        ? `${plan.name} - ${dateStr}`
                        : plan.name;

                    return {
                      value: plan.id,
                      label,
                    };
                  }) ?? []
                }
                placeholder="Выберите план производства"
                isLoading={isPlansLoading}
              />

              <Button
                type="button"
                size="small"
                color="primary"
                onClick={() => setIsCreatePlanOpen(true)}
                icon={<Plus />}
              >
                Создать план
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="small"
                disabled
                icon={<FileText />}
              >
                Создать маршрутный лист
              </Button>
              <Button
                type="button"
                size="small"
                disabled
                icon={<ListPlus />}
              >
                Добавить операции
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-lg/5 border border-gray-200 p-6">
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

      <CreatePlanModal
        isOpen={isCreatePlanOpen}
        form={createForm}
        formError={formError}
        isSubmitting={createPlanMutation.isPending}
        onFieldChange={(field, value) =>
          setCreateForm((prev) => ({
            ...prev,
            [field]: value,
          }))
        }
        onClose={() => {
          setIsCreatePlanOpen(false);
          setFormError(null);
        }}
        onSubmit={() => createPlanMutation.mutate()}
      />
    </div>
  );
}

