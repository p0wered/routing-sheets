import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useRoleLabel } from '../hooks/useRoleLabel';
import type { OperationListItem, OperationStatus } from '../types/routingSheet';
import { OP_STATUS_COLORS } from '../types/routingSheet';
import { RoutingHeader } from '../components/Header';
import { Select } from '../components/DropdownSelector';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { SplitQuantityModal } from '../components/SplitQuantityModal';
import { Spinner } from '../components/Spinner';
import { guildsApi, performersApi } from '../api/references';
import {
  getOperationsByGuild,
  changeOperationStatus,
  assignPerformer,
  getOperationStatuses,
  splitOperation,
} from '../api/operations';
import { toast, extractError } from '../utils/toast';
import { Button } from '../components/Button';
import {
  Play,
  CircleCheck,
  Ban,
  Clock,
  UserPlus,
  Scissors,
} from 'lucide-react';

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

export default function OperationsByGuildPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const roleLabel = useRoleLabel(user?.role ?? '');
  const queryClient = useQueryClient();

  const isGuildLocked = user?.role === 'WorkshopChief' || user?.role === 'WorkshopForeman';
  const [selectedGuildId, setSelectedGuildId] = useState<number | null>(null);

  useEffect(() => {
    if (isGuildLocked && user?.guildId) {
      setSelectedGuildId(user.guildId);
    }
  }, [isGuildLocked, user?.guildId]);

  const [opStatusChange, setOpStatusChange] = useState<{
    op: OperationListItem;
    statusId: number;
  } | null>(null);

  const [assigningPerformerOp, setAssigningPerformerOp] = useState<OperationListItem | null>(null);
  const [selectedPerformerId, setSelectedPerformerId] = useState<number | null>(null);

  const [splittingOp, setSplittingOp] = useState<OperationListItem | null>(null);
  const [splitOpError, setSplitOpError] = useState<string | null>(null);

  const { data: guilds, isLoading: isGuildsLoading } = useQuery({
    queryKey: ['guilds'],
    queryFn: guildsApi.getAll,
  });

  const { data: operations, isLoading: isOpsLoading } = useQuery({
    queryKey: ['operations-by-guild', selectedGuildId],
    queryFn: () => getOperationsByGuild(selectedGuildId!),
    enabled: selectedGuildId !== null,
  });

  const { data: opStatuses } = useQuery({
    queryKey: ['operationStatuses'],
    queryFn: getOperationStatuses,
  });

  const { data: performers } = useQuery({
    queryKey: ['performers'],
    queryFn: performersApi.getAll,
    enabled: assigningPerformerOp !== null,
  });

  const opStatusMutation = useMutation({
    mutationFn: ({ id, statusId }: { id: number; statusId: number }) =>
      changeOperationStatus(id, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations-by-guild', selectedGuildId] });
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
      queryClient.invalidateQueries({ queryKey: ['operations-by-guild', selectedGuildId] });
      setAssigningPerformerOp(null);
      setSelectedPerformerId(null);
      toast.success(t('routingSheets.toastPerformerAssigned'));
    },
    onError: (err: unknown) => {
      toast.error(extractError(err, t('routingSheets.toastPerformerAssignFailed')));
    },
  });

  const splitOpMutation = useMutation({
    mutationFn: ({ id, splitQuantity }: { id: number; splitQuantity: number }) =>
      splitOperation(id, { splitQuantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations-by-guild', selectedGuildId] });
      setSplittingOp(null);
      setSplitOpError(null);
      toast.success(t('routingSheets.toastOpSplit'));
    },
    onError: (err: unknown) => {
      setSplitOpError(extractError(err, t('routingSheets.toastOpSplitFailed')));
      toast.error(extractError(err, t('routingSheets.toastOpSplitFailed')));
    },
  });

  if (!user) return null;

  const canAssignPerformer = user.role === 'WorkshopChief' || user.role === 'WorkshopForeman';
  const canChangeOpStatus = user.role === 'WorkshopChief' || user.role === 'WorkshopForeman';

  const selectedGuild = guilds?.find((g) => g.id === selectedGuildId);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <RoutingHeader user={user} roleLabel={roleLabel} onLogout={logout} />

      <main className="px-4 sm:px-6 lg:px-6 py-6">
        <section className="bg-white rounded-3xl shadow-lg/5 border border-gray-200 p-3 mb-3">
          <div className="flex flex-wrap items-stretch gap-3">
            <Select<number>
              className="h-full"
              value={selectedGuildId}
              onChange={setSelectedGuildId}
              options={guilds?.map((g) => ({ value: g.id, label: g.name })) ?? []}
              placeholder={t('operationsGuild.selectGuild')}
              isLoading={isGuildsLoading}
              disabled={isGuildLocked}
            />
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-lg/5 border border-gray-200 overflow-hidden">
          {!selectedGuild ? (
            <div className="p-6 text-sm text-gray-500">
              {t('operationsGuild.hintSelectGuild')}
            </div>
          ) : isOpsLoading ? (
            <div className="p-6 flex justify-center">
              <Spinner />
            </div>
          ) : !operations?.length ? (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{selectedGuild.name}</h2>
              <p className="text-sm text-gray-500">{t('operationsGuild.noOperations')}</p>
            </div>
          ) : (
            <>
              <div className="px-6 pt-5 pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">{selectedGuild.name}</h2>
                  <p className="text-sm text-gray-500">{t('common.total', { count: operations.length })}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <th className="px-4 py-3 font-semibold text-gray-600">{t('common.rsShort')}</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 w-10">{t('common.numberSign')}</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">{t('common.code')}</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">{t('common.name')}</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">{t('common.performer')}</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-center">
                        {t('common.quantityShort')}
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-right">{t('common.price')}</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-right">{t('common.sum')}</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-center">
                        {t('common.status')}
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-right">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {operations.map((op) => {
                      const opTransitions = getOpAvailableTransitions(op);
                      return (
                        <tr
                          key={op.id}
                          className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition"
                        >
                          <td className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">
                            {op.routingSheetNumber ?? `#${op.routingSheetId}`}
                          </td>
                          <td className="px-4 py-3 text-gray-500 font-mono">{op.seqNumber}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {op.code ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-900 font-medium max-w-[200px] truncate">
                            {op.name}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span className="truncate max-w-[220px]">
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
                            {op.price != null ? (op.price * op.quantity).toFixed(2) : '—'}
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
                                opTransitions.map((st) => {
                                  const Icon = STATUS_ICONS[st.id] ?? Clock;
                                  const hoverStyle =
                                    STATUS_ICON_STYLES[st.id] ??
                                    'hover:bg-primary/8 hover:text-primary';
                                  return (
                                    <button
                                      key={st.id}
                                      type="button"
                                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 ${hoverStyle} transition cursor-pointer`}
                                      onClick={() => setOpStatusChange({ op, statusId: st.id })}
                                      title={t('common.statusWithName', { name: st.name })}
                                    >
                                      <Icon className="w-3.5 h-3.5" />
                                    </button>
                                  );
                                })}
                              {op.quantity > 1 && (
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition cursor-pointer"
                                  onClick={() => {
                                    setSplittingOp(op);
                                    setSplitOpError(null);
                                  }}
                                  title={t('operationsGuild.splitQuantityTooltip')}
                                >
                                  <Scissors className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>

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

      {splittingOp && (
        <SplitQuantityModal
          isOpen={!!splittingOp}
          title={t('operationsGuild.splitByQuantityTitle')}
          currentQuantity={splittingOp.quantity}
          isSubmitting={splitOpMutation.isPending}
          error={splitOpError}
          onClose={() => {
            setSplittingOp(null);
            setSplitOpError(null);
          }}
          onSubmit={(splitQuantity) => {
            splitOpMutation.mutate({ id: splittingOp.id, splitQuantity });
          }}
        />
      )}

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
