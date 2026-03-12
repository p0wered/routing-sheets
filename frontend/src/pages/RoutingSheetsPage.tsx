import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../types/auth';
import type { CreatePlanFormState } from '../types/plan';
import type {
  RoutingSheetListItem,
  RoutingSheetStatus,
  OperationListItem,
  OperationStatus,
} from '../types/routingSheet';
import { OP_STATUS_COLORS } from '../types/routingSheet';
import { Button } from '../components/Button';
import { RoutingHeader } from '../components/Header';
import { Select } from '../components/DropdownSelector';
import { CreatePlanModal } from '../components/CreatePlanModal';
import { RoutingSheetModal } from '../components/RoutingSheetModal';
import { OperationModal } from '../components/OperationModal';
import { SplitRoutingSheetModal } from '../components/SplitRoutingSheetModal';
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
  splitRoutingSheet,
} from '../api/routingSheets';
import {
  getOperationsByRoutingSheet,
  createOperation,
  updateOperation,
  deleteOperation,
  assignPerformer,
  changeOperationStatus,
  getOperationStatuses,
} from '../api/operations';
import { performersApi } from '../api/references';
import {
  Plus,
  FileText,
  Pencil,
  Trash2,
  Play,
  CircleCheck,
  Ban,
  ChevronDown,
  ChevronRight,
  Scissors,
  UserPlus,
  Clock,
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
  1: [2, 4],
  2: [3, 4],
  3: [],
  4: [],
};

const OP_STATUS_TRANSITIONS: Record<number, number[]> = {
  1: [2, 4],
  2: [3, 4],
  3: [],
  4: [],
};

const STATUS_ICONS: Record<number, typeof Play> = {
  2: Play,
  3: CircleCheck,
  4: Ban,
};

const STATUS_ICON_STYLES: Record<number, string> = {
  2: 'hover:bg-blue-50 hover:text-blue-600',
  3: 'hover:bg-green-50 hover:text-green-600',
  4: 'hover:bg-red-50 hover:text-error',
};

function OpStatusBadge({
  statusId,
  statusName,
  statuses,
}: {
  statusId: number | null;
  statusName: string | null;
  statuses?: OperationStatus[];
}) {
  const status = statuses?.find((s) => s.id === statusId);
  const code = status?.code ?? '';
  const label = statusName ?? status?.name ?? '—';
  const colors = OP_STATUS_COLORS[code] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span
      className={`inline-block ${colors.bg} ${colors.text} rounded-lg px-2.5 py-1 text-xs font-semibold`}
    >
      {label}
    </span>
  );
}

export default function RoutingSheetsPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreatePlanFormState>(() => {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    return { documentNumber: '', documentDate: iso, planningPeriod: '' };
  });
  const [formError, setFormError] = useState<string | null>(null);

  const [isRsModalOpen, setIsRsModalOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState<RoutingSheetListItem | null>(null);
  const [rsModalError, setRsModalError] = useState<string | null>(null);

  const [deletingSheet, setDeletingSheet] = useState<RoutingSheetListItem | null>(null);

  const [statusChangeSheet, setStatusChangeSheet] = useState<RoutingSheetListItem | null>(null);
  const [targetStatusId, setTargetStatusId] = useState<number | null>(null);

  // Expanded rows for operations
  const [expandedSheetId, setExpandedSheetId] = useState<number | null>(null);

  // Operation CRUD
  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
  const [editingOp, setEditingOp] = useState<OperationListItem | null>(null);
  const [opModalError, setOpModalError] = useState<string | null>(null);
  const [deletingOp, setDeletingOp] = useState<OperationListItem | null>(null);

  // Operation status change
  const [opStatusChange, setOpStatusChange] = useState<{
    op: OperationListItem;
    statusId: number;
  } | null>(null);

  // Performer assignment
  const [assigningPerformerOp, setAssigningPerformerOp] = useState<OperationListItem | null>(null);
  const [selectedPerformerId, setSelectedPerformerId] = useState<number | null>(null);

  // Split
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitSheet, setSplitSheet] = useState<RoutingSheetListItem | null>(null);
  const [splitError, setSplitError] = useState<string | null>(null);

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

  const { data: opStatuses } = useQuery({
    queryKey: ['operationStatuses'],
    queryFn: getOperationStatuses,
  });

  const { data: expandedOps, isLoading: isOpsLoading } = useQuery({
    queryKey: ['operations', expandedSheetId],
    queryFn: () => getOperationsByRoutingSheet(expandedSheetId!),
    enabled: expandedSheetId !== null,
  });

  const { data: performers } = useQuery({
    queryKey: ['performers'],
    queryFn: performersApi.getAll,
    enabled: assigningPerformerOp !== null,
  });

  // Plan creation
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

  // Routing sheet CRUD mutations
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
      if (expandedSheetId === deletingSheet?.id) setExpandedSheetId(null);
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

  // Split mutation
  const splitMutation = useMutation({
    mutationFn: (data: Parameters<typeof splitRoutingSheet>[1] & { sourceId: number }) =>
      splitRoutingSheet(data.sourceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routingSheets', selectedPlanId] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      closeSplitModal();
    },
    onError: (err: unknown) => {
      setSplitError(extractError(err, 'Не удалось разбить маршрутный лист'));
    },
  });

  // Operation CRUD mutations
  const createOpMutation = useMutation({
    mutationFn: createOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', expandedSheetId] });
      closeOpModal();
    },
    onError: (err: unknown) => {
      setOpModalError(extractError(err, 'Не удалось создать операцию'));
    },
  });

  const updateOpMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof updateOperation>[1];
    }) => updateOperation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', expandedSheetId] });
      closeOpModal();
    },
    onError: (err: unknown) => {
      setOpModalError(extractError(err, 'Не удалось обновить операцию'));
    },
  });

  const deleteOpMutation = useMutation({
    mutationFn: deleteOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', expandedSheetId] });
      setDeletingOp(null);
    },
    onError: (err: unknown) => {
      setDeletingOp(null);
      alert(extractError(err, 'Не удалось удалить операцию'));
    },
  });

  const opStatusMutation = useMutation({
    mutationFn: ({ id, statusId }: { id: number; statusId: number }) =>
      changeOperationStatus(id, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', expandedSheetId] });
      setOpStatusChange(null);
    },
    onError: (err: unknown) => {
      setOpStatusChange(null);
      alert(extractError(err, 'Не удалось изменить статус операции'));
    },
  });

  const assignPerformerMutation = useMutation({
    mutationFn: ({ id, performerId }: { id: number; performerId: number }) =>
      assignPerformer(id, performerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', expandedSheetId] });
      setAssigningPerformerOp(null);
      setSelectedPerformerId(null);
    },
    onError: (err: unknown) => {
      alert(extractError(err, 'Не удалось назначить исполнителя'));
    },
  });

  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  const selectedPlan: PlanPositionListItem | undefined = plans?.find(
    (p) => p.id === selectedPlanId,
  );

  const canManageSheets = user.role === 'PlanningDept' || user.role === 'WorkshopChief';
  const canChangeStatus = user.role === 'PlanningDept' || user.role === 'WorkshopChief';
  const canManageOps =
    user.role === 'WorkshopChief' || user.role === 'WorkshopForeman' || user.role === 'PlanningDept';
  const canAssignPerformer = user.role === 'WorkshopChief' || user.role === 'WorkshopForeman';
  const canChangeOpStatus = user.role === 'WorkshopChief' || user.role === 'WorkshopForeman';

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

  // Expand/collapse row
  function toggleExpand(sheetId: number) {
    setExpandedSheetId((prev) => (prev === sheetId ? null : sheetId));
  }

  // Operation modal helpers
  function openCreateOp() {
    setEditingOp(null);
    setOpModalError(null);
    setIsOpModalOpen(true);
  }

  function openEditOp(op: OperationListItem) {
    setEditingOp(op);
    setOpModalError(null);
    setIsOpModalOpen(true);
  }

  function closeOpModal() {
    setIsOpModalOpen(false);
    setEditingOp(null);
    setOpModalError(null);
  }

  function handleOpSubmit(values: {
    code: string | null;
    name: string;
    guildId: number | null;
    operationTypeId: number | null;
    performerId: number | null;
    statusId: number | null;
    price: number | null;
    sum: number | null;
    quantity: number;
  }) {
    setOpModalError(null);
    if (editingOp) {
      updateOpMutation.mutate({
        id: editingOp.id,
        data: {
          seqNumber: editingOp.seqNumber,
          code: values.code,
          name: values.name,
          statusId: values.statusId,
          guildId: values.guildId,
          operationTypeId: values.operationTypeId,
          performerId: values.performerId,
          price: values.price,
          sum: values.sum,
          quantity: values.quantity,
        },
      });
    } else {
      const nextSeq = (expandedOps?.length ?? 0) + 1;
      createOpMutation.mutate({
        routingSheetId: expandedSheetId!,
        seqNumber: nextSeq,
        code: values.code,
        name: values.name,
        statusId: values.statusId ?? 1,
        guildId: values.guildId,
        operationTypeId: values.operationTypeId,
        performerId: values.performerId,
        price: values.price,
        sum: values.sum,
        quantity: values.quantity,
      });
    }
  }

  // Operation status helpers
  function getOpAvailableTransitions(op: OperationListItem): OperationStatus[] {
    const currentId = op.statusId ?? 1;
    const nextIds = OP_STATUS_TRANSITIONS[currentId] ?? [];
    if (!opStatuses) return [];
    return opStatuses.filter((s) => nextIds.includes(s.id));
  }

  function getOpTargetStatusName(): string {
    if (!opStatusChange || !opStatuses) return '';
    return opStatuses.find((s) => s.id === opStatusChange.statusId)?.name ?? '';
  }

  // Split helpers
  function openSplit(sheet: RoutingSheetListItem) {
    setSplitSheet(sheet);
    setSplitError(null);
    setIsSplitModalOpen(true);
  }

  function closeSplitModal() {
    setIsSplitModalOpen(false);
    setSplitSheet(null);
    setSplitError(null);
  }

  function handleSplitSubmit(values: {
    operationIds: number[];
    newNumber: string;
    newName: string;
    newQuantity: number;
  }) {
    if (!splitSheet) return;
    setSplitError(null);
    splitMutation.mutate({ sourceId: splitSheet.id, ...values });
  }

  const isRsSubmitting = createRsMutation.isPending || updateRsMutation.isPending;
  const isOpSubmitting = createOpMutation.isPending || updateOpMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      <RoutingHeader user={user} roleLabel={roleLabel} onLogout={logout} />

      <main className="mx-auto px-4 sm:px-6 py-6">
        {/* Toolbar */}
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
                    const label = dateStr !== '—' ? `${plan.name} - ${dateStr}` : plan.name;
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
              Выберите план производства, чтобы увидеть связанные маршрутные листы.
            </div>
          ) : isSheetsLoading ? (
            <div className="p-6 flex justify-center">
              <Spinner />
            </div>
          ) : !routingSheets?.length ? (
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedPlan.name}</h2>
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
                    <h2 className="text-lg font-semibold text-gray-900">{selectedPlan.name}</h2>
                    <p className="text-sm text-gray-500">
                      {formatDateRu(selectedPlan.documentDate) !== '—'
                        ? `Дата: ${formatDateRu(selectedPlan.documentDate)}`
                        : ''}
                      {selectedPlan.planningPeriod
                        ? `${formatDateRu(selectedPlan.documentDate) !== '—' ? ' · ' : ''}Период: ${selectedPlan.planningPeriod}`
                        : ''}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">Всего: {routingSheets.length}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <th className="px-3 py-3 w-8" />
                      <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                        Номер
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                        Наименование
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                        Изделие
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                        Ед. изм.
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap text-center">
                        Кол-во
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap text-center">
                        Статус
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                        Создан
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap text-right">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {routingSheets.map((sheet) => {
                      const transitions = getAvailableTransitions(sheet);
                      const isExpanded = expandedSheetId === sheet.id;

                      return (
                        <>
                          <tr
                            key={sheet.id}
                            className={`border-b border-gray-100 hover:bg-gray-50/50 transition cursor-pointer ${isExpanded ? 'bg-primary/5' : ''}`}
                            onClick={() => toggleExpand(sheet.id)}
                          >
                            <td className="px-3 py-4 text-gray-400">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </td>
                            <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">
                              {sheet.number}
                            </td>
                            <td className="px-4 py-4 text-gray-700 max-w-[200px] truncate">
                              {sheet.name}
                            </td>
                            <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                              {sheet.productItemName ?? '—'}
                            </td>
                            <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                              {sheet.unitName ?? '—'}
                            </td>
                            <td className="px-4 py-4 text-gray-600 text-center whitespace-nowrap">
                              {sheet.quantity}
                            </td>
                            <td className="px-4 py-4 text-center whitespace-nowrap">
                              <StatusBadge
                                statusId={sheet.statusId}
                                statusName={sheet.statusName}
                                statuses={statuses}
                              />
                            </td>
                            <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                              {formatDateRu(sheet.createdAt)}
                            </td>
                            <td
                              className="px-4 py-4 text-right whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="inline-flex gap-1">
                                {canChangeStatus &&
                                  transitions.map((t) => {
                                    const Icon = STATUS_ICONS[t.id] ?? Play;
                                    const hoverStyle =
                                      STATUS_ICON_STYLES[t.id] ??
                                      'hover:bg-primary/8 hover:text-primary';
                                    return (
                                      <button
                                        key={t.id}
                                        type="button"
                                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 ${hoverStyle} transition cursor-pointer`}
                                        onClick={() => openStatusChange(sheet, t.id)}
                                        title={`Сменить статус на: ${t.name}`}
                                      >
                                        <Icon className="w-4 h-4" />
                                      </button>
                                    );
                                  })}

                                {canManageSheets && (
                                  <>
                                    <button
                                      type="button"
                                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition cursor-pointer"
                                      onClick={() => openSplit(sheet)}
                                      title="Разбить маршрутный лист"
                                    >
                                      <Scissors className="w-4 h-4" />
                                    </button>
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

                          {/* Expanded operations panel */}
                          {isExpanded && (
                            <tr key={`ops-${sheet.id}`}>
                              <td colSpan={9} className="p-0">
                                <div className="bg-primary/3 border-b border-gray-200 p-4">
                                  <div className="flex items-center justify-between pl-2 mb-2">
                                    <h3 className="text-sm font-semibold text-gray-700">
                                      Операции маршрутного листа «{sheet.number}»
                                    </h3>
                                    {canManageOps && (
                                      <Button
                                        type="button"
                                        size="small"
                                        color="primary"
                                        onClick={openCreateOp}
                                        icon={<Plus />}
                                      />
                                    )}
                                  </div>

                                  {isOpsLoading ? (
                                    <div className="flex justify-center py-4">
                                      <Spinner size="sm" />
                                    </div>
                                  ) : !expandedOps?.length ? (
                                    <p className="text-sm text-gray-500 py-2">
                                      Операции ещё не добавлены.
                                    </p>
                                  ) : (
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                      <table className="w-full text-sm text-left">
                                        <thead>
                                          <tr className="border-b border-gray-200 bg-gray-50/50">
                                            <th className="px-4 py-2.5 font-semibold text-gray-600 w-10">
                                              №
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600">
                                              Код
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600">
                                              Наименование
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600">
                                              Тип
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600">
                                              Цех
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600">
                                              Исполнитель
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600 text-center">
                                              Кол-во
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600 text-right">
                                              Цена
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600 text-right">
                                              Сумма
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600 text-center">
                                              Статус
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600 text-right">
                                              Действия
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {expandedOps.map((op) => {
                                            const opTransitions =
                                              getOpAvailableTransitions(op);

                                            return (
                                              <tr
                                                key={op.id}
                                                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition"
                                              >
                                                <td className="px-4 py-3 text-gray-500 font-mono">
                                                  {op.seqNumber}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                  {op.code ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-900 font-medium max-w-[160px] truncate">
                                                  {op.name}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                  {op.operationTypeName ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                  {op.guildName ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                  <div className="flex items-center gap-1">
                                                    <span className="truncate max-w-[120px]">
                                                      {op.performerName ?? '—'}
                                                    </span>
                                                    {canAssignPerformer && !op.performerId && (
                                                      <button
                                                        type="button"
                                                        className="inline-flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-primary hover:bg-primary/8 transition cursor-pointer"
                                                        onClick={() => {
                                                          setAssigningPerformerOp(op);
                                                          setSelectedPerformerId(null);
                                                        }}
                                                        title="Назначить исполнителя"
                                                      >
                                                        <UserPlus className="w-3.5 h-3.5" />
                                                      </button>
                                                    )}
                                                  </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 text-center whitespace-nowrap">
                                                  {op.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 text-right whitespace-nowrap">
                                                  {op.price != null
                                                    ? op.price.toFixed(2)
                                                    : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 text-right whitespace-nowrap">
                                                  {op.sum != null ? op.sum.toFixed(2) : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                                  <OpStatusBadge
                                                    statusId={op.statusId}
                                                    statusName={op.statusName}
                                                    statuses={opStatuses}
                                                  />
                                                </td>
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                  <div className="inline-flex gap-0.5">
                                                    {canChangeOpStatus &&
                                                      opTransitions.map((t) => {
                                                        const Icon =
                                                          STATUS_ICONS[t.id] ?? Clock;
                                                        const hoverStyle =
                                                          STATUS_ICON_STYLES[t.id] ??
                                                          'hover:bg-primary/8 hover:text-primary';
                                                        return (
                                                          <button
                                                            key={t.id}
                                                            type="button"
                                                            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 ${hoverStyle} transition cursor-pointer`}
                                                            onClick={() =>
                                                              setOpStatusChange({
                                                                op,
                                                                statusId: t.id,
                                                              })
                                                            }
                                                            title={`Статус: ${t.name}`}
                                                          >
                                                            <Icon className="w-3.5 h-3.5" />
                                                          </button>
                                                        );
                                                      })}

                                                    {canManageOps && (
                                                      <>
                                                        <button
                                                          type="button"
                                                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:bg-primary/8 hover:text-primary transition cursor-pointer"
                                                          onClick={() => openEditOp(op)}
                                                          title="Редактировать"
                                                        >
                                                          <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                          type="button"
                                                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:bg-red-50 hover:text-error transition cursor-pointer"
                                                          onClick={() => setDeletingOp(op)}
                                                          title="Удалить"
                                                        >
                                                          <Trash2 className="w-3.5 h-3.5" />
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
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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

      {/* Operation modal */}
      <OperationModal
        isOpen={isOpModalOpen}
        editingOp={editingOp}
        isSubmitting={isOpSubmitting}
        error={opModalError}
        onClose={closeOpModal}
        onSubmit={handleOpSubmit}
      />

      {/* Split routing sheet modal */}
      <SplitRoutingSheetModal
        isOpen={isSplitModalOpen}
        sourceSheet={splitSheet}
        isSubmitting={splitMutation.isPending}
        error={splitError}
        onClose={closeSplitModal}
        onSubmit={handleSplitSubmit}
      />

      {/* Delete routing sheet confirmation */}
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

      {/* Delete operation confirmation */}
      {deletingOp && (
        <ConfirmDialog
          title="Удаление операции"
          message={`Удалить операцию «${deletingOp.name}» (№${deletingOp.seqNumber})? Это действие нельзя отменить.`}
          confirmLabel="Удалить"
          confirmLoadingLabel="Удаление..."
          confirmColor="error"
          confirmIcon={<Trash2 className="w-4 h-4" />}
          isLoading={deleteOpMutation.isPending}
          onConfirm={() => deleteOpMutation.mutate(deletingOp.id)}
          onCancel={() => setDeletingOp(null)}
        />
      )}

      {/* Status change confirmation (routing sheet) */}
      {statusChangeSheet &&
        targetStatusId &&
        (() => {
          const TargetIcon = STATUS_ICONS[targetStatusId] ?? Play;
          return (
            <ConfirmDialog
              title="Изменение статуса"
              message={`Сменить статус маршрутного листа «${statusChangeSheet.number}» на «${getTargetStatusName()}»?`}
              confirmLabel="Сменить"
              confirmLoadingLabel="Смена статуса..."
              confirmColor={targetStatusId === 4 ? 'error' : 'primary'}
              confirmIcon={<TargetIcon className="w-4 h-4" />}
              isLoading={statusMutation.isPending}
              onConfirm={() =>
                statusMutation.mutate({ id: statusChangeSheet.id, statusId: targetStatusId })
              }
              onCancel={() => {
                setStatusChangeSheet(null);
                setTargetStatusId(null);
              }}
            />
          );
        })()}

      {/* Operation status change confirmation */}
      {opStatusChange &&
        (() => {
          const TargetIcon = STATUS_ICONS[opStatusChange.statusId] ?? Clock;
          return (
            <ConfirmDialog
              title="Изменение статуса операции"
              message={`Сменить статус операции «${opStatusChange.op.name}» на «${getOpTargetStatusName()}»?`}
              confirmLabel="Сменить"
              confirmLoadingLabel="Смена статуса..."
              confirmColor={opStatusChange.statusId === 4 ? 'error' : 'primary'}
              confirmIcon={<TargetIcon className="w-4 h-4" />}
              isLoading={opStatusMutation.isPending}
              onConfirm={() =>
                opStatusMutation.mutate({
                  id: opStatusChange.op.id,
                  statusId: opStatusChange.statusId,
                })
              }
              onCancel={() => setOpStatusChange(null)}
            />
          );
        })()}

      {/* Assign performer modal */}
      {assigningPerformerOp && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-xs"
          onClick={() => {
            setAssigningPerformerOp(null);
            setSelectedPerformerId(null);
          }}
        >
          <div
            className="bg-white rounded-3xl shadow-xl/5 w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Назначить исполнителя
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Операция: {assigningPerformerOp.name} (№{assigningPerformerOp.seqNumber})
            </p>
            <div className="mb-4">
              <Select<number>
                value={selectedPerformerId}
                onChange={setSelectedPerformerId}
                options={performers?.map((p) => ({ value: p.id, label: p.fullName })) ?? []}
                placeholder="Выберите исполнителя"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                size="small"
                color="primary"
                className="w-full"
                disabled={!selectedPerformerId || assignPerformerMutation.isPending}
                onClick={() => {
                  if (selectedPerformerId) {
                    assignPerformerMutation.mutate({
                      id: assigningPerformerOp.id,
                      performerId: selectedPerformerId,
                    });
                  }
                }}
                icon={<UserPlus />}
              >
                {assignPerformerMutation.isPending ? 'Назначение...' : 'Назначить'}
              </Button>
              <Button
                type="button"
                size="small"
                color="secondary"
                className="w-full"
                onClick={() => {
                  setAssigningPerformerOp(null);
                  setSelectedPerformerId(null);
                }}
                disabled={assignPerformerMutation.isPending}
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
