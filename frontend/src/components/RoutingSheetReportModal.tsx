import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Select } from './DropdownSelector';
import { getRoutingSheetById, getRoutingSheets } from '../api/routingSheets';
import type { RoutingSheetListItem } from '../types/routingSheet';
import {
  openPeriodRoutingSheetsPdf,
  openSingleRoutingSheetPdf,
  type PeriodPdfLabels,
  type SingleSheetPdfLabels,
} from '../utils/routingSheetPdf';
import { toast, extractError } from '../utils/toast';

type ReportMode = 'single' | 'period';

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function ymdToIsoUtcStart(dateStr: string): string {
  return `${dateStr}T00:00:00.000Z`;
}

function ymdToIsoUtcEnd(dateStr: string): string {
  return `${dateStr}T23:59:59.999Z`;
}

export interface RoutingSheetReportModalProps {
  open: boolean;
  onClose: () => void;
  /** Маршрутные листы, уже отфильтрованные по цеху (как на странице) */
  sheetsForPicker: RoutingSheetListItem[];
  /** Границы периода по умолчанию (месяц/год с плана) */
  defaultMonth: number;
  defaultYear: number;
  /** Для планового отдела — выбранный цех; иначе цех пользователя */
  guildIdFilter?: number;
}

export function RoutingSheetReportModal({
  open,
  onClose,
  sheetsForPicker,
  defaultMonth,
  defaultYear,
  guildIdFilter,
}: RoutingSheetReportModalProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en-US' : 'ru-RU';

  const [mode, setMode] = useState<ReportMode>('single');
  const [selectedSheetId, setSelectedSheetId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  const sortedSheets = useMemo(() => {
    return [...sheetsForPicker].sort((a, b) =>
      a.number.localeCompare(b.number, undefined, { numeric: true }),
    );
  }, [sheetsForPicker]);

  useEffect(() => {
    if (!open) return;
    const y = defaultYear;
    const m = defaultMonth;
    const from = `${y}-${String(m).padStart(2, '0')}-01`;
    const last = lastDayOfMonth(y, m);
    const to = `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
    setDateFrom(from);
    setDateTo(to);
    setMode('single');
    const sorted = [...sheetsForPicker].sort((a, b) =>
      a.number.localeCompare(b.number, undefined, { numeric: true }),
    );
    setSelectedSheetId(sorted[0]?.id ?? null);
  }, [open, defaultMonth, defaultYear, sheetsForPicker]);

  const singleLabels: SingleSheetPdfLabels = useMemo(
    () => ({
      title: t('routingSheets.reportPdf.single.title'),
      subtitleMeta: t('routingSheets.reportPdf.single.subtitleMeta'),
      fieldNumber: t('routingSheets.reportPdf.single.fieldNumber'),
      fieldName: t('routingSheets.reportPdf.single.fieldName'),
      fieldStatus: t('routingSheets.reportPdf.single.fieldStatus'),
      fieldProduct: t('routingSheets.reportPdf.single.fieldProduct'),
      fieldUnit: t('routingSheets.reportPdf.single.fieldUnit'),
      fieldQuantity: t('routingSheets.reportPdf.single.fieldQuantity'),
      fieldCreated: t('routingSheets.reportPdf.single.fieldCreated'),
      fieldUpdated: t('routingSheets.reportPdf.single.fieldUpdated'),
      sectionPlan: t('routingSheets.reportPdf.single.sectionPlan'),
      fieldPlanCode: t('routingSheets.reportPdf.single.fieldPlanCode'),
      fieldPlanMonth: t('routingSheets.reportPdf.single.fieldPlanMonth'),
      fieldGuild: t('routingSheets.reportPdf.single.fieldGuild'),
      sectionOperations: t('routingSheets.reportPdf.single.sectionOperations'),
      colSeq: t('routingSheets.reportPdf.single.colSeq'),
      colCode: t('routingSheets.reportPdf.single.colCode'),
      colName: t('routingSheets.reportPdf.single.colName'),
      colType: t('routingSheets.reportPdf.single.colType'),
      colGuild: t('routingSheets.reportPdf.single.colGuild'),
      colQty: t('routingSheets.reportPdf.single.colQty'),
      colPrice: t('routingSheets.reportPdf.single.colPrice'),
      colSum: t('routingSheets.reportPdf.single.colSum'),
      colStatus: t('routingSheets.reportPdf.single.colStatus'),
      colPerformer: t('routingSheets.reportPdf.single.colPerformer'),
      emptyDash: t('routingSheets.reportPdf.single.emptyDash'),
    }),
    [t],
  );

  async function handleGenerate() {
    if (mode === 'single') {
      if (selectedSheetId == null) {
        toast.error(t('routingSheets.reportEmptyList'));
        return;
      }
      setLoading(true);
      try {
        const detail = await getRoutingSheetById(selectedSheetId);
        openSingleRoutingSheetPdf(detail, singleLabels, locale);
        onClose();
      } catch (err) {
        toast.error(extractError(err, t('routingSheets.toastSheetGenerateFailed')));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!dateFrom || !dateTo) {
      toast.error(t('routingSheets.reportInvalidPeriod'));
      return;
    }
    if (dateFrom > dateTo) {
      toast.error(t('routingSheets.reportInvalidPeriod'));
      return;
    }

    setLoading(true);
    try {
      const createdFrom = ymdToIsoUtcStart(dateFrom);
      const createdTo = ymdToIsoUtcEnd(dateTo);
      const list = await getRoutingSheets({
        createdFrom,
        createdTo,
        ...(guildIdFilter != null ? { guildId: guildIdFilter } : {}),
      });
      if (!list.length) {
        toast.error(t('routingSheets.reportEmptyList'));
        return;
      }
      const periodLabels: PeriodPdfLabels = {
        title: t('routingSheets.reportPdf.period.title'),
        periodLine: t('routingSheets.reportPdf.period.periodLine'),
        sheetCount: t('routingSheets.reportPdf.period.sheetCount', { count: list.length }),
        colNumber: t('routingSheets.reportPdf.period.colNumber'),
        colName: t('routingSheets.reportPdf.period.colName'),
        colProduct: t('routingSheets.reportPdf.period.colProduct'),
        colUnit: t('routingSheets.reportPdf.period.colUnit'),
        colQty: t('routingSheets.reportPdf.period.colQty'),
        colStatus: t('routingSheets.reportPdf.period.colStatus'),
        colCreated: t('routingSheets.reportPdf.period.colCreated'),
        emptyDash: t('routingSheets.reportPdf.period.emptyDash'),
      };
      openPeriodRoutingSheetsPdf(list, createdFrom, createdTo, periodLabels, locale);
      onClose();
    } catch (err) {
      toast.error(extractError(err, t('routingSheets.toastSheetGenerateFailed')));
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-xl/5 w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('routingSheets.reportModalTitle')}
        </h2>

        <div className="flex gap-4 mb-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="reportMode"
              checked={mode === 'single'}
              onChange={() => setMode('single')}
              className="accent-primary"
            />
            {t('routingSheets.reportModeSingle')}
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="reportMode"
              checked={mode === 'period'}
              onChange={() => setMode('period')}
              className="accent-primary"
            />
            {t('routingSheets.reportModePeriod')}
          </label>
        </div>

        {mode === 'single' ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('routingSheets.reportSelectSheet')}
            </label>
            <Select<number>
              value={selectedSheetId}
              onChange={(v) => setSelectedSheetId(v)}
              options={sortedSheets.map((s) => ({
                value: s.id,
                label: `${s.number} — ${s.name}`,
              }))}
              placeholder={t('common.selectValue')}
            />
            {!sortedSheets.length && (
              <p className="text-xs text-amber-700 mt-2">{t('routingSheets.reportEmptyList')}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('routingSheets.reportDateFrom')}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('routingSheets.reportDateTo')}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            size="small"
            color="primary"
            className="flex-1"
            onClick={() => void handleGenerate()}
            disabled={loading || (mode === 'single' && !sortedSheets.length)}
          >
            {loading ? t('routingSheets.reportBuilding') : t('routingSheets.reportOpenPdf')}
          </Button>
          <Button
            type="button"
            size="small"
            color="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
