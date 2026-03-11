import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../types/auth';
import type { CreatePlanFormState } from '../types/plan';
import type { RoutingSheetListItem, RoutingSheetStatus } from '../types/routingSheet';
import { Button } from '../components/Button';
import { RoutingHeader } from '../components/Header';
import { Select } from '../components/DropdownSelector';
import { CreatePlanModal } from '../components/CreatePlanModal';
import { RoutingSheetModal } from '../components/RoutingSheetModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusBadge } from '../components/StatusBadge';
import { Spinner } from '../components/Spinner';
import {
  getPlanPositions,
  createPlanPosition,
  type PlanPositionListItem,
} from '../api/planPositions';
import {
  getRoutingSheets,
  createRoutingSheet,
  updateRoutingSheet,
  deleteRoutingSheet,
  changeRoutingSheetStatus,
  getRoutingSheetStatuses,
} from '../api/routingSheets';
import {
  Plus,
  FileText,
  Pencil,
  Trash2,
  ArrowRightLeft,
} from 'lucide-react';

function formatDateRu(dateIso: string) {
  if (!dateIso) return '—';
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  if (yyyy < 1900) return '—';
  return `${dd}.${mm}.${yyyy}`;
}

function extractError(error: unknown, fallback: string): string {
  const axiosError = error as { response?: { data?: string | { message?: string } } };
  if (typeof axiosError.response?.data === 'string') return axiosError.response.data;
  if (typeof axiosError.response?.data === 'object' && axiosError.response.data?.message)
    return axiosError.response.data.message;
  return fallback;
}

const STATUS_TRANSITIONS: Record<number, number[]> = {
  1: [2, 4],    // Черновик -> Активен | Отменен
  2: [3, 4],    // Активен -> Завершен | Отменен
  3: [],        // Завершен (финальный)
  4: [],        // Отменен (финальный)
};

export default function RoutingSheetsPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  // Plan selection
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreatePlanFormState>(() => {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    return { documentNumber: '', documentDate: iso, planningPeriod: '' };
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Routing sheet CRUD
  const [isRsModalOpen, setIsRsModalOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState<RoutingSheetListItem | null>(null);
  const [rsModalError, setRsModalError] = useState<string | null>(null);

  // Delete confirmation
  const [deletingSheet, setDeletingSheet] = useState<RoutingSheetListItem | null>(null);

  // Status change
  const [statusChangeSheet, setStatusChangeSheet] = useState<RoutingSheetListItem | null>(null);
  const [targetStatusId, setTargetStatusId] = useState<number | null>(null);

  // Queries
  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['planPositions'],
    queryFn: getPlanPositions,
  });

  const { data: routingSheets, isLoading: isSheetsLoading } = useQuery({
    queryKey: ['routingSheets', selectedPlanId],
    queryFn: () => getRoutingSheets(selectedPlanId ? { planPositionId: selectedPlanId } : undefined),
    enabled: selectedPlanId !== null,
  });

  const { data: statuses } = useQuery({
    queryKey: ['routingSheetStatuses'],
    queryFn: getRoutingSheetStatuses,
  });

  // Plan creation mutation
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
      return await createPlanPosition(payload);
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['planPositions'] });
      setIsCreatePlanOpen(false);
      setSelectedPlanId(created.id);
      setCreateForm((prev) => ({ ...prev, documentNumber: '' }));
    },
    onError: (error: unknown) => {
      setFormError(extractError(error, 'Не удалось создать план производства'));
    },
  });

  // Routing sheet mutations
  const createRsMutation = useMutation({
    mutationFn: createRoutingSheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routingSheets', selectedPlanId] });
      closeRsModal();
    },
    onError: (err: unknown) => {
      setRsModalError(extractError(err, 'Не удалось создать маршрутный лист'));
    },
  });

  const updateRsMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateRoutingSheet>[1] }) =>
      updateRoutingSheet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routingSheets', selectedPlanId] });
      closeRsModal();
    },
    onError: (err: unknown) => {
      setRsModalError(extractError(err, 'Не удалось обновить маршрутный лист'));
    },
  });

  const deleteRsMutation = useMutation({
    mutationFn: deleteRoutingSheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routingSheets', selectedPlanId] });
      setDeletingSheet(null);
    },
    onError: (err: unknown) => {
      setDeletingSheet(null);
      alert(extractError(err, 'Не удалось удалить маршрутный лист'));
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, statusId }: { id: number; statusId: number }) =>
      changeRoutingSheetStatus(id, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routingSheets', selectedPlanId] });
      setStatusChangeSheet(null);
      setTargetStatusId(null);
    },
    onError: (err: unknown) => {
      setStatusChangeSheet(null);
      setTargetStatusId(null);
      alert(extractError(err, 'Не удалось изменить статус'));
    },
  });

  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  const selectedPlan: PlanPositionListItem | undefined = plans?.find(
    (p) => p.id === selectedPlanId
  );

  const canManageSheets =
    user.role === 'PlanningDept' || user.role === 'WorkshopChief';

  const canChangeStatus =
    user.role === 'PlanningDept' || user.role === 'WorkshopChief';

  // RS modal helpers
  function openCreateRs() {
    setEditingSheet(null);
    setRsModalError(null);
    setIsRsModalOpen(true);
  }

  function openEditRs(sheet: RoutingSheetListItem) {
    setEditingSheet(sheet);
    setRsModalError(null);
    setIsRsModalOpen(true);
  }

  function closeRsModal() {
    setIsRsModalOpen(false);
    setEditingSheet(null);
    setRsModalError(null);
  }

  function handleRsSubmit(values: {
    number: string;
    name: string;
    planPositionId: number | null;
    productItemId: number | null;
    unitId: number | null;
    quantity: number;
  }) {
    setRsModalError(null);
    if (editingSheet) {
      updateRsMutation.mutate({ id: editingSheet.id, data: values });
    } else {
      createRsMutation.mutate(values);
    }
  }

  // Status change helpers
  function openStatusChange(sheet: RoutingSheetListItem, newStatusId: number) {
    setStatusChangeSheet(sheet);
    setTargetStatusId(newStatusId);
  }

  function getAvailableTransitions(sheet: RoutingSheetListItem): RoutingSheetStatus[] {
    const nextIds = STATUS_TRANSITIONS[sheet.statusId] ?? [];
    if (!statuses) return [];
    return statuses.filter((s) => nextIds.includes(s.id));
  }

  function getTargetStatusName(): string {
    if (!targetStatusId || !statuses) return '';
    return statuses.find((s) => s.id === targetStatusId)?.name ?? '';
  }

  const isRsSubmitting = createRsMutation.isPending || updateRsMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      <RoutingHeader user={user} roleLabel={roleLabel} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toolbar: Plan selection + create routing sheet */}
        <section className="bg-white rounded-3xl shadow-lg/5 border border-gray-200 p-3 mb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:justify-between">
            <div className="flex flex-wrap items-stretch gap-3">
              <Select
                className="h-full"
                value={selectedPlanId}
                onChange={setSelectedPlanId}
                options={
                  plans?.map((plan) => {
                    const dateStr = formatDateRu(plan.documentDate);
                    const label =
                      dateStr !== '—' ? `${plan.name} - ${dateStr}` : plan.name;
                    return { value: plan.id, label };
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

            {canManageSheets && (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="small"
                  color="primary"
                  disabled={!selectedPlanId}
                  onClick={openCreateRs}
                  icon={<FileText />}
                >
                  Создать маршрутный лист
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Routing Sheets Table */}
        <section className="bg-white rounded-3xl shadow-lg/5 border border-gray-200 overflow-hidden">
          {!selectedPlan ? (
            <div className="p-6 text-sm text-gray-500">
              Выберите план производства, чтобы увидеть связанные маршрутные
              листы.
            </div>
          ) : isSheetsLoading ? (
            <div className="p-6 flex justify-center">
              <Spinner />
            </div>
          ) : !routingSheets?.length ? (
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedPlan.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatDateRu(selectedPlan.documentDate) !== '—'
                      ? `Дата: ${formatDateRu(selectedPlan.documentDate)}`
                      : ''}
                    {selectedPlan.planningPeriod
                      ? `${formatDateRu(selectedPlan.documentDate) !== '—' ? ' · ' : ''}Период: ${selectedPlan.planningPeriod}`
                      : ''}
                  </p>
                </div>
              </div>
              <div className="text-center text-sm text-gray-500 py-4">
                Маршрутные листы для этого плана ещё не созданы.
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 pt-5 pb-3">
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
                        ? `${formatDateRu(selectedPlan.documentDate) !== '—' ? ' · ' : ''}Период: ${selectedPlan.planningPeriod}`
                        : ''}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Всего: {routingSheets.length}
                  </p>
                </div>
              </div>

              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-6 py-3 font-semibold text-gray-600">Номер</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Наименование</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Изделие</th>
                    <th className="px-6 py-3 font-semibold text-gray-600 text-center">Кол-во</th>
                    <th className="px-6 py-3 font-semibold text-gray-600 text-center">Статус</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Создан</th>
                    <th className="px-6 py-3 font-semibold text-gray-600 text-right">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {routingSheets.map((sheet) => {
                    const transitions = getAvailableTransitions(sheet);

                    return (
                      <tr
                        key={sheet.id}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {sheet.number}
                        </td>
                        <td className="px-6 py-4 text-gray-700 max-w-[200px] truncate">
                          {sheet.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {sheet.productItemName ?? '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-center">
                          {sheet.quantity}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge
                            statusId={sheet.statusId}
                            statusName={sheet.statusName}
                            statuses={statuses}
                          />
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {formatDateRu(sheet.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex gap-1">
                            {/* Status transition buttons */}
                            {canChangeStatus && transitions.map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                className="inline-flex items-center justify-center h-8 rounded-lg text-xs px-2 text-gray-500 hover:bg-primary/8 hover:text-primary transition cursor-pointer"
                                onClick={() => openStatusChange(sheet, t.id)}
                                title={`Сменить статус на: ${t.name}`}
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
                                {t.name}
                              </button>
                            ))}

                            {canManageSheets && (
                              <>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-primary/8 hover:text-primary transition cursor-pointer"
                                  onClick={() => openEditRs(sheet)}
                                  title="Редактировать"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-red-50 hover:text-error transition cursor-pointer"
                                  onClick={() => setDeletingSheet(sheet)}
                                  title="Удалить"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </section>
      </main>

      {/* Create plan modal */}
      <CreatePlanModal
        isOpen={isCreatePlanOpen}
        form={createForm}
        formError={formError}
        isSubmitting={createPlanMutation.isPending}
        onFieldChange={(field, value) =>
          setCreateForm((prev) => ({ ...prev, [field]: value }))
        }
        onClose={() => {
          setIsCreatePlanOpen(false);
          setFormError(null);
        }}
        onSubmit={() => createPlanMutation.mutate()}
      />

      {/* Create / Edit routing sheet modal */}
      <RoutingSheetModal
        isOpen={isRsModalOpen}
        editingSheet={editingSheet}
        defaultPlanPositionId={selectedPlanId}
        isSubmitting={isRsSubmitting}
        error={rsModalError}
        onClose={closeRsModal}
        onSubmit={handleRsSubmit}
      />

      {/* Delete confirmation */}
      {deletingSheet && (
        <ConfirmDialog
          title="Удаление маршрутного листа"
          message={`Вы уверены, что хотите удалить маршрутный лист «${deletingSheet.number}»? Все связанные операции также будут удалены. Это действие нельзя отменить.`}
          confirmLabel="Удалить"
          confirmLoadingLabel="Удаление..."
          confirmColor="error"
          confirmIcon={<Trash2 className="w-4 h-4" />}
          isLoading={deleteRsMutation.isPending}
          onConfirm={() => deleteRsMutation.mutate(deletingSheet.id)}
          onCancel={() => setDeletingSheet(null)}
        />
      )}

      {/* Status change confirmation */}
      {statusChangeSheet && targetStatusId && (
        <ConfirmDialog
          title="Изменение статуса"
          message={`Сменить статус маршрутного листа «${statusChangeSheet.number}» на «${getTargetStatusName()}»?`}
          confirmLabel={`Да, сменить на «${getTargetStatusName()}»`}
          confirmLoadingLabel="Смена статуса..."
          confirmColor="primary"
          confirmIcon={<ArrowRightLeft className="w-4 h-4" />}
          isLoading={statusMutation.isPending}
          onConfirm={() =>
            statusMutation.mutate({ id: statusChangeSheet.id, statusId: targetStatusId })
          }
          onCancel={() => {
            setStatusChangeSheet(null);
            setTargetStatusId(null);
          }}
        />
      )}
    </div>
  );
}
