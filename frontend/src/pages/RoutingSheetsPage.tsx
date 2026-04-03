import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useRoleLabel } from '../hooks/useRoleLabel';
import type { PlanPositionListItem } from '../types/plan';
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
import { MonthYearPicker } from '../components/MonthYearPicker';
import { PlanStatusBadge } from '../components/PlanStatusBadge';
import { SplitQuantityModal } from '../components/SplitQuantityModal';
import { RoutingSheetReportModal } from '../components/RoutingSheetReportModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusBadge } from '../components/StatusBadge';
import { Spinner } from '../components/Spinner';
import { getPlanPositions, changePlanPositionStatus, getPlanStatuses } from '../api/planPositions';
import {
  getRoutingSheets,
  generateRoutingSheet,
  changeRoutingSheetStatus,
  getRoutingSheetStatuses,
  splitRoutingSheet,
} from '../api/routingSheets';
import {
  getOperationsByRoutingSheet,
  assignPerformer,
  changeOperationStatus,
  getOperationStatuses,
  splitOperation,
} from '../api/operations';
import { guildsApi, performersApi } from '../api/references';
import { toast, extractError } from '../utils/toast';
import {
  Play,
  CircleCheck,
  Ban,
  ChevronDown,
  ChevronRight,
  Scissors,
  UserPlus,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Zap,
  Lock,
  Printer,
} from 'lucide-react';

type SortDirection = 'asc' | 'desc';

type OpSortField =
  | 'seqNumber'
  | 'code'
  | 'name'
  | 'operationTypeName'
  | 'guildName'
  | 'performerName'
  | 'quantity'
  | 'price'
  | 'sum'
  | 'statusName';

function compareFieldValues(a: unknown, b: unknown, locale: string): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), locale);
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
  return direction === 'asc' ? (
    <ArrowUp className="w-3 h-3 text-primary" />
  ) : (
    <ArrowDown className="w-3 h-3 text-primary" />
  );
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
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const roleLabel = useRoleLabel(user?.role ?? '');
  const queryClient = useQueryClient();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedGuildId, setSelectedGuildId] = useState<number | null>(null);

  // Expanded plan row → shows routing sheets
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  // Expanded routing sheet row → shows operations
  const [expandedSheetId, setExpandedSheetId] = useState<number | null>(null);

  // RS status change
  const [statusChangeSheet, setStatusChangeSheet] = useState<RoutingSheetListItem | null>(null);
  const [targetStatusId, setTargetStatusId] = useState<number | null>(null);

  // Operation status change
  const [opStatusChange, setOpStatusChange] = useState<{
    op: OperationListItem;
    statusId: number;
  } | null>(null);

  // Performer assignment
  const [assigningPerformerOp, setAssigningPerformerOp] = useState<OperationListItem | null>(null);
  const [selectedPerformerId, setSelectedPerformerId] = useState<number | null>(null);

  // Split RS
  const [splitSheet, setSplitSheet] = useState<RoutingSheetListItem | null>(null);
  const [splitSheetError, setSplitSheetError] = useState<string | null>(null);

  // Split operation
  const [splitOp, setSplitOp] = useState<OperationListItem | null>(null);
  const [splitOpError, setSplitOpError] = useState<string | null>(null);

  // Generate confirmation
  const [generatingPlan, setGeneratingPlan] = useState<PlanPositionListItem | null>(null);

  // Close plan confirmation
  const [closingPlan, setClosingPlan] = useState<PlanPositionListItem | null>(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Operation sorting
  const [opSortField, setOpSortField] = useState<OpSortField | null>(null);
  const [opSortDir, setOpSortDir] = useState<SortDirection>('asc');

  // ─── Derived guild filter ───
  const isPlanningDept = user?.role === 'PlanningDept';
  const effectiveGuildId = isPlanningDept ? selectedGuildId : user?.guildId ?? null;

  // ─── Queries ───
  const { data: guilds } = useQuery({
    queryKey: ['guilds'],
    queryFn: guildsApi.getAll,
    enabled: isPlanningDept,
  });

  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['planPositions', selectedMonth, selectedYear, effectiveGuildId],
    queryFn: () =>
      getPlanPositions({
        month: selectedMonth,
        year: selectedYear,
        ...(effectiveGuildId ? { guildId: effectiveGuildId } : {}),
      }),
  });

  const { data: planStatuses } = useQuery({
    queryKey: ['planStatuses'],
    queryFn: getPlanStatuses,
  });

  const { data: routingSheetsForPlan, isLoading: isSheetsLoading } = useQuery({
    queryKey: ['routingSheets', expandedPlanId],
    queryFn: () => getRoutingSheets({ planPositionId: expandedPlanId! }),
    enabled: expandedPlanId !== null,
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

  // Preload all routing sheets for the current month to know which plans have RS
  const { data: allRoutingSheets } = useQuery({
    queryKey: ['allRoutingSheets', selectedMonth, selectedYear, effectiveGuildId],
    queryFn: () =>
      getRoutingSheets(effectiveGuildId ? { guildId: effectiveGuildId } : undefined),
  });

  const rsByPlanId = useMemo(() => {
    const map = new Map<number, RoutingSheetListItem[]>();
    if (!allRoutingSheets) return map;
    for (const rs of allRoutingSheets) {
      if (rs.planPositionId == null) continue;
      const list = map.get(rs.planPositionId) ?? [];
      list.push(rs);
      map.set(rs.planPositionId, list);
    }
    return map;
  }, [allRoutingSheets]);

  /** МЛ только по планам выбранного в календаре месяца/года (для отчёта) */
  const routingSheetsInSelectedPeriod = useMemo(() => {
    if (!plans?.length || !allRoutingSheets) return [];
    const planIds = new Set(plans.map((p) => p.id));
    return allRoutingSheets.filter(
      (rs) => rs.planPositionId != null && planIds.has(rs.planPositionId),
    );
  }, [plans, allRoutingSheets]);

  const reportPeriodLabel = useMemo(() => {
    const monthNames = t('months', { returnObjects: true }) as string[];
    const name = monthNames[selectedMonth - 1] ?? '';
    return `${name} ${selectedYear}`;
  }, [t, selectedMonth, selectedYear]);

  // ─── Mutations ───
  const generateMutation = useMutation({
    mutationFn: (planPositionId: number) => generateRoutingSheet(planPositionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routingSheets'] });
      queryClient.invalidateQueries({ queryKey: ['allRoutingSheets'] });
      queryClient.invalidateQueries({ queryKey: ['planPositions'] });
      setGeneratingPlan(null);
      toast.success(t('routingSheets.toastSheetGenerated'));
    },
    onError: (err: unknown) => {
      setGeneratingPlan(null);
      toast.error(extractError(err, t('routingSheets.toastSheetGenerateFailed')));
    },
  });

  const closePlanMutation = useMutation({
    mutationFn: (id: number) => changePlanPositionStatus(id, 2),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planPositions'] });
      setClosingPlan(null);
      toast.success(t('routingSheets.toastPlanClosed'));
    },
    onError: (err: unknown) => {
      setClosingPlan(null);
      toast.error(extractError(err, t('routingSheets.toastPlanCloseFailed')));
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, statusId }: { id: number; statusId: number }) =>
      changeRoutingSheetStatus(id, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routingSheets'] });
      queryClient.invalidateQueries({ queryKey: ['allRoutingSheets'] });
      setStatusChangeSheet(null);
      setTargetStatusId(null);
      toast.success(t('routingSheets.toastRsStatusChanged'));
    },
    onError: (err: unknown) => {
      setStatusChangeSheet(null);
      setTargetStatusId(null);
      toast.error(extractError(err, t('routingSheets.toastStatusChangeFailed')));
    },
  });

  const splitRsMutation = useMutation({
    mutationFn: ({ id, splitQuantity }: { id: number; splitQuantity: number }) =>
      splitRoutingSheet(id, { splitQuantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routingSheets'] });
      queryClient.invalidateQueries({ queryKey: ['allRoutingSheets'] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      setSplitSheet(null);
      setSplitSheetError(null);
      toast.success(t('routingSheets.toastRsSplit'));
    },
    onError: (err: unknown) => {
      const msg = extractError(err, t('routingSheets.toastRsSplitFailed'));
      setSplitSheetError(msg);
      toast.error(msg);
    },
  });

  const splitOpMutation = useMutation({
    mutationFn: ({ id, splitQuantity }: { id: number; splitQuantity: number }) =>
      splitOperation(id, { splitQuantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', expandedSheetId] });
      setSplitOp(null);
      setSplitOpError(null);
      toast.success(t('routingSheets.toastOpSplit'));
    },
    onError: (err: unknown) => {
      const msg = extractError(err, t('routingSheets.toastOpSplitFailed'));
      setSplitOpError(msg);
      toast.error(msg);
    },
  });

  const opStatusMutation = useMutation({
    mutationFn: ({ id, statusId }: { id: number; statusId: number }) =>
      changeOperationStatus(id, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', expandedSheetId] });
      setOpStatusChange(null);
      toast.success(t('routingSheets.toastOpStatusChanged'));
    },
    onError: (err: unknown) => {
      setOpStatusChange(null);
      toast.error(extractError(err, t('routingSheets.toastOpStatusFailed')));
    },
  });

  const assignPerformerMutation = useMutation({
    mutationFn: ({ id, performerId }: { id: number; performerId: number }) =>
      assignPerformer(id, performerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', expandedSheetId] });
      setAssigningPerformerOp(null);
      setSelectedPerformerId(null);
      toast.success(t('routingSheets.toastPerformerAssigned'));
    },
    onError: (err: unknown) => {
      toast.error(extractError(err, t('routingSheets.toastPerformerAssignFailed')));
    },
  });

  if (!user) return null;

  const canManageSheets = user.role === 'PlanningDept' || user.role === 'WorkshopChief';
  const canChangeStatus = user.role === 'PlanningDept' || user.role === 'WorkshopChief';
  const canAssignPerformer = user.role === 'WorkshopChief' || user.role === 'WorkshopForeman';
  const canChangeOpStatus = user.role === 'WorkshopChief' || user.role === 'WorkshopForeman';

  // ─── Helpers ───
  function handleMonthChange(month: number, year: number) {
    setSelectedMonth(month);
    setSelectedYear(year);
    setExpandedPlanId(null);
    setExpandedSheetId(null);
  }

  function togglePlanExpand(planId: number) {
    if (expandedPlanId === planId) {
      setExpandedPlanId(null);
      setExpandedSheetId(null);
    } else {
      setExpandedPlanId(planId);
      setExpandedSheetId(null);
    }
  }

  function toggleSheetExpand(sheetId: number) {
    setExpandedSheetId((prev) => (prev === sheetId ? null : sheetId));
  }

  function getTargetStatusName(): string {
    if (!targetStatusId || !statuses) return '';
    return statuses.find((s) => s.id === targetStatusId)?.name ?? '';
  }

  function getOpTargetStatusName(): string {
    if (!opStatusChange || !opStatuses) return '';
    return opStatuses.find((s) => s.id === opStatusChange.statusId)?.name ?? '';
  }

  function toggleOpSort(field: OpSortField) {
    if (opSortField === field) {
      setOpSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setOpSortField(field);
      setOpSortDir('asc');
    }
  }

  const sortedOps = useMemo(() => {
    if (!expandedOps || !opSortField) return expandedOps;
    const loc = i18n.language.startsWith('en') ? 'en' : 'ru';
    return [...expandedOps].sort((a, b) => {
      const cmp = compareFieldValues(a[opSortField], b[opSortField], loc);
      return opSortDir === 'asc' ? cmp : -cmp;
    });
  }, [expandedOps, opSortField, opSortDir, i18n.language]);

  function planHasRoutingSheets(planId: number): boolean {
    return (rsByPlanId.get(planId)?.length ?? 0) > 0;
  }

  function getPlanRoutingSheets(planId: number): RoutingSheetListItem[] {
    return rsByPlanId.get(planId) ?? [];
  }

  // ─── Render ───
  return (
    <div className="min-h-screen bg-gray-50">
      <RoutingHeader user={user} roleLabel={roleLabel} onLogout={logout} />

      <main className="mx-auto px-4 sm:px-6 py-6">
        {/* Toolbar: Month picker + Guild filter */}
        <section className="bg-white rounded-3xl shadow-lg/5 border border-gray-200 p-3 mb-3">
          <div className="flex flex-wrap items-center gap-4 w-full">
            <div className="flex flex-wrap items-center gap-4 min-w-0 flex-1">
              <MonthYearPicker
                month={selectedMonth}
                year={selectedYear}
                onChange={handleMonthChange}
              />
              {isPlanningDept && (
                <Select<number>
                  className="h-full"
                  value={selectedGuildId}
                  onChange={(v) => {
                    setSelectedGuildId(v);
                    setExpandedPlanId(null);
                    setExpandedSheetId(null);
                  }}
                  options={guilds?.map((g) => ({ value: g.id, label: g.name })) ?? []}
                  placeholder={t('routingSheets.allGuilds')}
                />
              )}
              {!isPlanningDept && user?.guildName && (
                <span className="text-sm text-gray-600">
                  {t('common.guild')}:{' '}
                  <span className="font-semibold text-gray-900">{user.guildName}</span>
                </span>
              )}
            </div>
            <Button
              type="button"
              size="small"
              color="primary"
              className="shrink-0 ms-auto"
              icon={<Printer className="w-4 h-4" />}
              onClick={() => setReportModalOpen(true)}
            >
              {t('routingSheets.reportButton')}
            </Button>
          </div>
        </section>

        {/* Plans table */}
        <section className="bg-white rounded-3xl shadow-lg/5 border border-gray-200 overflow-hidden">
          {isPlansLoading ? (
            <div className="p-6 flex justify-center">
              <Spinner />
            </div>
          ) : !plans?.length ? (
            <div className="p-6 text-sm text-gray-500">
              {t('routingSheets.noPlans')}
            </div>
          ) : (
            <>
              <div className="px-6 pt-5 pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t('routingSheets.plansTitle')}
                  </h2>
                  <p className="text-sm text-gray-500">{t('common.total', { count: plans.length })}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <th className="px-3 py-3 w-8" />
                      <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                        {t('common.code')}
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                        {t('common.name')}
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                        {t('common.product')}
                      </th>
                      {isPlanningDept && (
                        <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                          {t('common.guild')}
                        </th>
                      )}
                      <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap text-center">
                        {t('common.quantityShort')}
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap text-center">
                        {t('common.status')}
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap text-center">
                        {t('common.rsShort')}
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap text-right">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => {
                      const isExpanded = expandedPlanId === plan.id;
                      const hasRS = planHasRoutingSheets(plan.id);
                      const planRS = getPlanRoutingSheets(plan.id);
                      const isOpen = plan.statusId === 1;

                      return (
                        <PlanRow
                          key={plan.id}
                          plan={plan}
                          isExpanded={isExpanded}
                          hasRS={hasRS}
                          planRS={planRS}
                          isOpen={isOpen}
                          isPlanningDept={isPlanningDept}
                          canManageSheets={canManageSheets}
                          planStatuses={planStatuses}
                          statuses={statuses}
                          opStatuses={opStatuses}
                          expandedSheetId={expandedSheetId}
                          routingSheetsForPlan={isExpanded ? routingSheetsForPlan : undefined}
                          isSheetsLoading={isExpanded ? isSheetsLoading : false}
                          expandedOps={sortedOps}
                          isOpsLoading={isOpsLoading}
                          canChangeStatus={canChangeStatus}
                          canAssignPerformer={canAssignPerformer}
                          canChangeOpStatus={canChangeOpStatus}
                          opSortField={opSortField}
                          opSortDir={opSortDir}
                          onTogglePlan={() => togglePlanExpand(plan.id)}
                          onToggleSheet={toggleSheetExpand}
                          onGenerate={() => setGeneratingPlan(plan)}
                          onClosePlan={() => setClosingPlan(plan)}
                          onStatusChange={(sheet, statusId) => {
                            setStatusChangeSheet(sheet);
                            setTargetStatusId(statusId);
                          }}
                          onSplitSheet={(sheet) => {
                            setSplitSheet(sheet);
                            setSplitSheetError(null);
                          }}
                          onSplitOp={(op) => {
                            setSplitOp(op);
                            setSplitOpError(null);
                          }}
                          onOpStatusChange={(op, statusId) =>
                            setOpStatusChange({ op, statusId })
                          }
                          onAssignPerformer={(op) => {
                            setAssigningPerformerOp(op);
                            setSelectedPerformerId(null);
                          }}
                          onToggleOpSort={toggleOpSort}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>

      <RoutingSheetReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        sheetsInPlanPeriod={routingSheetsInSelectedPeriod}
        periodLabel={reportPeriodLabel}
      />

      {/* Generate RS confirmation */}
      {generatingPlan && (
        <ConfirmDialog
          title={t('routingSheets.confirmGenerateTitle')}
          message={t('routingSheets.confirmGenerateMessage', {
            code: generatingPlan.positionCode,
            name: generatingPlan.productItemName ?? generatingPlan.name,
            qty: generatingPlan.quantityPlanned,
          })}
          confirmLabel={t('common.generate')}
          confirmLoadingLabel={t('common.generating')}
          confirmColor="primary"
          confirmIcon={<Zap className="w-4 h-4" />}
          isLoading={generateMutation.isPending}
          onConfirm={() => generateMutation.mutate(generatingPlan.id)}
          onCancel={() => setGeneratingPlan(null)}
        />
      )}

      {/* Close plan confirmation */}
      {closingPlan && (
        <ConfirmDialog
          title={t('routingSheets.confirmCloseTitle')}
          message={t('routingSheets.confirmCloseMessage', { code: closingPlan.positionCode })}
          confirmLabel={t('common.close')}
          confirmLoadingLabel={t('common.closing')}
          confirmColor="error"
          confirmIcon={<Lock className="w-4 h-4" />}
          isLoading={closePlanMutation.isPending}
          onConfirm={() => closePlanMutation.mutate(closingPlan.id)}
          onCancel={() => setClosingPlan(null)}
        />
      )}

      {/* RS status change confirmation */}
      {statusChangeSheet &&
        targetStatusId &&
        (() => {
          const TargetIcon = STATUS_ICONS[targetStatusId] ?? Play;
          return (
            <ConfirmDialog
              title={t('routingSheets.confirmRsStatusTitle')}
              message={t('routingSheets.confirmRsStatusMessage', {
                number: statusChangeSheet.number,
                status: getTargetStatusName(),
              })}
              confirmLabel={t('common.change')}
              confirmLoadingLabel={t('common.changingStatus')}
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
              title={t('routingSheets.confirmOpStatusTitle')}
              message={t('routingSheets.confirmOpStatusMessage', {
                name: opStatusChange.op.name,
                status: getOpTargetStatusName(),
              })}
              confirmLabel={t('common.change')}
              confirmLoadingLabel={t('common.changingStatus')}
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

      {/* Split RS modal */}
      <SplitQuantityModal
        isOpen={splitSheet !== null}
        title={t('routingSheets.splitRsTitle', { number: splitSheet?.number ?? '' })}
        currentQuantity={splitSheet?.quantity ?? 1}
        isSubmitting={splitRsMutation.isPending}
        error={splitSheetError}
        onClose={() => {
          setSplitSheet(null);
          setSplitSheetError(null);
        }}
        onSubmit={(qty) => {
          if (splitSheet) splitRsMutation.mutate({ id: splitSheet.id, splitQuantity: qty });
        }}
      />

      {/* Split operation modal */}
      <SplitQuantityModal
        isOpen={splitOp !== null}
        title={t('routingSheets.splitOpTitle', { name: splitOp?.name ?? '' })}
        currentQuantity={splitOp?.quantity ?? 1}
        isSubmitting={splitOpMutation.isPending}
        error={splitOpError}
        onClose={() => {
          setSplitOp(null);
          setSplitOpError(null);
        }}
        onSubmit={(qty) => {
          if (splitOp) splitOpMutation.mutate({ id: splitOp.id, splitQuantity: qty });
        }}
      />

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
              {t('routingSheets.assignPerformerTitle')}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {t('routingSheets.assignPerformerHint', {
                name: assigningPerformerOp.name,
                seq: assigningPerformerOp.seqNumber,
              })}
            </p>
            <div className="mb-4">
              <Select<number>
                value={selectedPerformerId}
                onChange={setSelectedPerformerId}
                options={performers?.map((p) => ({ value: p.id, label: p.fullName })) ?? []}
                placeholder={t('routingSheets.selectPerformer')}
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
                {assignPerformerMutation.isPending ? t('common.assigning') : t('common.assign')}
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
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Plan Row (extracted for readability) ───

interface PlanRowProps {
  plan: PlanPositionListItem;
  isExpanded: boolean;
  hasRS: boolean;
  planRS: RoutingSheetListItem[];
  isOpen: boolean;
  isPlanningDept: boolean;
  canManageSheets: boolean;
  planStatuses?: import('../types/plan').PlanStatus[];
  statuses?: RoutingSheetStatus[];
  opStatuses?: OperationStatus[];
  expandedSheetId: number | null;
  routingSheetsForPlan?: RoutingSheetListItem[];
  isSheetsLoading: boolean;
  expandedOps?: OperationListItem[];
  isOpsLoading: boolean;
  canChangeStatus: boolean;
  canAssignPerformer: boolean;
  canChangeOpStatus: boolean;
  opSortField: OpSortField | null;
  opSortDir: SortDirection;
  onTogglePlan: () => void;
  onToggleSheet: (id: number) => void;
  onGenerate: () => void;
  onClosePlan: () => void;
  onStatusChange: (sheet: RoutingSheetListItem, statusId: number) => void;
  onSplitSheet: (sheet: RoutingSheetListItem) => void;
  onSplitOp: (op: OperationListItem) => void;
  onOpStatusChange: (op: OperationListItem, statusId: number) => void;
  onAssignPerformer: (op: OperationListItem) => void;
  onToggleOpSort: (field: OpSortField) => void;
}

function PlanRow({
  plan,
  isExpanded,
  hasRS,
  planRS,
  isOpen,
  isPlanningDept,
  canManageSheets,
  planStatuses,
  statuses,
  opStatuses,
  expandedSheetId,
  routingSheetsForPlan,
  isSheetsLoading,
  expandedOps,
  isOpsLoading,
  canChangeStatus,
  canAssignPerformer,
  canChangeOpStatus,
  opSortField,
  opSortDir,
  onTogglePlan,
  onToggleSheet,
  onGenerate,
  onClosePlan,
  onStatusChange,
  onSplitSheet,
  onSplitOp,
  onOpStatusChange,
  onAssignPerformer,
  onToggleOpSort,
}: PlanRowProps) {
  const { t } = useTranslation();
  const colSpan = isPlanningDept ? 9 : 8;

  return (
    <>
      <tr
        className="border-b border-gray-100 hover:bg-gray-50/50 transition cursor-pointer"
        onClick={onTogglePlan}
      >
        <td className="px-3 py-4 text-gray-400">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </td>
        <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">
          {plan.positionCode}
        </td>
        <td className="px-4 py-4 text-gray-700 max-w-[200px] truncate">
          {plan.name}
        </td>
        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
          {plan.productItemName ?? '—'}
        </td>
        {isPlanningDept && (
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
            {plan.guildName ?? '—'}
          </td>
        )}
        <td className="px-4 py-4 text-gray-600 text-center whitespace-nowrap">
          {plan.quantityPlanned}
        </td>
        <td className="px-4 py-4 text-center whitespace-nowrap">
          <PlanStatusBadge
            statusId={plan.statusId}
            statusName={plan.statusName}
            statuses={planStatuses}
          />
        </td>
        <td className="px-4 py-4 text-center whitespace-nowrap">
          {hasRS ? (
            <span className="text-xs text-primary font-medium">
              {t('routingSheets.rsCount', { count: planRS.length })}
            </span>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </td>
        <td
          className="px-4 py-4 text-right whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="inline-flex gap-1">
            {canManageSheets && isOpen && !hasRS && (
              <button
                type="button"
                className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg text-xs font-medium text-primary bg-primary/8 hover:bg-primary/15 transition cursor-pointer gap-1"
                onClick={onGenerate}
                title={t('routingSheets.generateRsTitle')}
              >
                <Zap className="w-3.5 h-3.5" />
                {t('common.generate')}
              </button>
            )}
            {canManageSheets && isOpen && (
              <button
                type="button"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-red-50 hover:text-error transition cursor-pointer"
                onClick={onClosePlan}
                title={t('routingSheets.closePlanTitle')}
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded: Routing Sheets for this plan */}
      {isExpanded && (
        <tr>
          <td colSpan={colSpan} className="p-0">
            <div className="bg-primary/3 border-b border-gray-200">
              {isSheetsLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" />
                </div>
              ) : !routingSheetsForPlan?.length ? (
                <div className="px-6 py-4 text-sm text-gray-500">
                  {t('routingSheets.noSheetsYet')}
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {routingSheetsForPlan.map((sheet) => {
                    const isSheetExpanded = expandedSheetId === sheet.id;
                    const transitions = canChangeStatus
                      ? (statuses?.filter((s) => (STATUS_TRANSITIONS[sheet.statusId] ?? []).includes(s.id)) ?? [])
                      : [];

                    return (
                      <div
                        key={sheet.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                      >
                        {/* Sheet header row */}
                        <div
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/50 transition"
                          onClick={() => onToggleSheet(sheet.id)}
                        >
                          <span className="text-gray-400">
                            {isSheetExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </span>
                          <span className="font-medium text-gray-900 text-sm">
                            {sheet.number}
                          </span>
                          <span className="text-sm text-gray-600 truncate max-w-[200px]">
                            {sheet.name}
                          </span>
                          {sheet.partName && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                              {sheet.partName}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {t('routingSheets.qtyLabel', { qty: sheet.quantity })}
                          </span>
                          <StatusBadge
                            statusId={sheet.statusId}
                            statusName={sheet.statusName}
                            statuses={statuses}
                          />
                          <div
                            className="ml-auto inline-flex gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {transitions.map((st) => {
                              const Icon = STATUS_ICONS[st.id] ?? Play;
                              const hoverStyle =
                                STATUS_ICON_STYLES[st.id] ??
                                'hover:bg-primary/8 hover:text-primary';
                              return (
                                <button
                                  key={st.id}
                                  type="button"
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 ${hoverStyle} transition cursor-pointer`}
                                  onClick={() => onStatusChange(sheet, st.id)}
                                  title={t('common.statusWithName', { name: st.name })}
                                >
                                  <Icon className="w-4 h-4" />
                                </button>
                              );
                            })}
                            {canManageSheets && (
                              <button
                                type="button"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition cursor-pointer"
                                onClick={() => onSplitSheet(sheet)}
                                title={t('routingSheets.splitRsTooltip')}
                              >
                                <Scissors className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Sheet operations */}
                        {isSheetExpanded && (
                          <div className="border-t border-gray-200">
                            {isOpsLoading ? (
                              <div className="flex justify-center py-4">
                                <Spinner size="sm" />
                              </div>
                            ) : !expandedOps?.length ? (
                              <p className="text-sm text-gray-500 px-4 py-3">
                                {t('routingSheets.noOperations')}
                              </p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                  <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50/50">
                                      <SortTh field="seqNumber" label={t('common.numberSign')} current={opSortField} dir={opSortDir} onSort={onToggleOpSort} className="w-10" />
                                      <SortTh field="code" label={t('common.code')} current={opSortField} dir={opSortDir} onSort={onToggleOpSort} />
                                      <SortTh field="name" label={t('common.name')} current={opSortField} dir={opSortDir} onSort={onToggleOpSort} />
                                      <SortTh field="operationTypeName" label={t('common.type')} current={opSortField} dir={opSortDir} onSort={onToggleOpSort} />
                                      <SortTh field="guildName" label={t('common.guild')} current={opSortField} dir={opSortDir} onSort={onToggleOpSort} />
                                      <SortTh field="performerName" label={t('common.performer')} current={opSortField} dir={opSortDir} onSort={onToggleOpSort} />
                                      <SortTh field="quantity" label={t('common.quantityShort')} current={opSortField} dir={opSortDir} onSort={onToggleOpSort} align="center" />
                                      <SortTh field="price" label={t('common.price')} current={opSortField} dir={opSortDir} onSort={onToggleOpSort} align="right" />
                                      <SortTh field="sum" label={t('common.sum')} current={opSortField} dir={opSortDir} onSort={onToggleOpSort} align="right" />
                                      <SortTh field="statusName" label={t('common.status')} current={opSortField} dir={opSortDir} onSort={onToggleOpSort} align="center" />
                                      <th className="px-4 py-2.5 font-semibold text-gray-600 text-right">
                                        {t('common.actions')}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {expandedOps.map((op) => {
                                      const opTransitions = canChangeOpStatus
                                        ? (opStatuses?.filter((s) => (OP_STATUS_TRANSITIONS[op.statusId ?? 1] ?? []).includes(s.id)) ?? [])
                                        : [];

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
                                                  onClick={() => onAssignPerformer(op)}
                                                  title={t('routingSheets.assignPerformerTooltip')}
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
                                            {op.price != null ? op.price.toFixed(2) : '—'}
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
                                              {opTransitions.map((st) => {
                                                const Icon = STATUS_ICONS[st.id] ?? Clock;
                                                const hoverStyle =
                                                  STATUS_ICON_STYLES[st.id] ??
                                                  'hover:bg-primary/8 hover:text-primary';
                                                return (
                                                  <button
                                                    key={st.id}
                                                    type="button"
                                                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 ${hoverStyle} transition cursor-pointer`}
                                                    onClick={() => onOpStatusChange(op, st.id)}
                                                    title={t('common.statusWithName', { name: st.name })}
                                                  >
                                                    <Icon className="w-3.5 h-3.5" />
                                                  </button>
                                                );
                                              })}
                                              <button
                                                type="button"
                                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition cursor-pointer"
                                                onClick={() => onSplitOp(op)}
                                                title={t('routingSheets.splitOpTooltip')}
                                              >
                                                <Scissors className="w-3.5 h-3.5" />
                                              </button>
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
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Sortable table header ───

function SortTh({
  field,
  label,
  current,
  dir,
  onSort,
  align,
  className = '',
}: {
  field: OpSortField;
  label: string;
  current: OpSortField | null;
  dir: SortDirection;
  onSort: (field: OpSortField) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
}) {
  const alignClass =
    align === 'center'
      ? 'text-center justify-center'
      : align === 'right'
        ? 'text-right justify-end'
        : '';
  return (
    <th
      className={`px-4 py-2.5 font-semibold text-gray-600 cursor-pointer select-none hover:text-gray-900 transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <span className={`inline-flex items-center gap-1 ${alignClass}`}>
        {label}
        <SortIcon active={current === field} direction={dir} />
      </span>
    </th>
  );
}
