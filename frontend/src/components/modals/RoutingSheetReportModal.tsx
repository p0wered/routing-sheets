import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Select } from '../ui/DropdownSelector';
import { getRoutingSheetById } from '../../api/routingSheets';
import type { RoutingSheetListItem } from '../../types/routingSheet';
import {
  openPeriodRoutingSheetsPdf,
  openSingleRoutingSheetPdf,
  type PeriodPdfLabels,
  type SingleSheetPdfLabels,
} from '../../utils/routingSheetPdf';
import { toast, extractError } from '../../utils/toast';

type ReportMode = 'single' | 'period';

export interface RoutingSheetReportModalProps {
  open: boolean;
  onClose: () => void;
  /** МЛ, привязанные к планам выбранного в календаре месяца/года */
  sheetsInPlanPeriod: RoutingSheetListItem[];
  /** Та же подпись, что у календаря (например «Февраль 2026») */
  periodLabel: string;
}

export function RoutingSheetReportModal({
  open,
  onClose,
  sheetsInPlanPeriod,
  periodLabel,
}: RoutingSheetReportModalProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en-US' : 'ru-RU';

  const [mode, setMode] = useState<ReportMode>('single');
  const [selectedSheetId, setSelectedSheetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const sortedSheets = useMemo(() => {
    return [...sheetsInPlanPeriod].sort((a, b) =>
      a.number.localeCompare(b.number, undefined, { numeric: true }),
    );
  }, [sheetsInPlanPeriod]);

  useEffect(() => {
    if (!open) return;
    setMode('single');
    const sorted = [...sheetsInPlanPeriod].sort((a, b) =>
      a.number.localeCompare(b.number, undefined, { numeric: true }),
    );
    setSelectedSheetId(sorted[0]?.id ?? null);
  }, [open, sheetsInPlanPeriod]);

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

  const noSheets = !sortedSheets.length;

  async function handleGenerate() {
    if (noSheets) {
      toast.error(t('routingSheets.reportEmptyList'));
      return;
    }

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

    setLoading(true);
    try {
      const periodLabels: PeriodPdfLabels = {
        title: t('routingSheets.reportPdf.period.title'),
        periodLine: t('routingSheets.reportPdf.period.periodLine'),
        sheetCount: t('routingSheets.reportPdf.period.sheetCount', { count: sortedSheets.length }),
        colNumber: t('routingSheets.reportPdf.period.colNumber'),
        colName: t('routingSheets.reportPdf.period.colName'),
        colProduct: t('routingSheets.reportPdf.period.colProduct'),
        colUnit: t('routingSheets.reportPdf.period.colUnit'),
        colQty: t('routingSheets.reportPdf.period.colQty'),
        colStatus: t('routingSheets.reportPdf.period.colStatus'),
        colCreated: t('routingSheets.reportPdf.period.colCreated'),
        emptyDash: t('routingSheets.reportPdf.period.emptyDash'),
      };
      openPeriodRoutingSheetsPdf(sortedSheets, periodLabel, periodLabels, locale);
      onClose();
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
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {t('routingSheets.reportModalTitle')}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {t('routingSheets.reportPeriodContext', { period: periodLabel })}
        </p>

        <div className="flex flex-col gap-3 mb-4 text-sm">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="reportMode"
              checked={mode === 'single'}
              onChange={() => setMode('single')}
              className="accent-primary mt-0.5"
            />
            <span>{t('routingSheets.reportModeSingle')}</span>
          </label>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="reportMode"
              checked={mode === 'period'}
              onChange={() => setMode('period')}
              className="accent-primary mt-0.5"
            />
            <span>{t('routingSheets.reportModePeriod')}</span>
          </label>
        </div>

        {mode === 'single' && (
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
            {noSheets && (
              <p className="text-xs text-amber-700 mt-2">{t('routingSheets.reportEmptyList')}</p>
            )}
          </div>
        )}

        {mode === 'period' && !noSheets && (
          <p className="text-sm text-gray-600 mb-6">
            {t('routingSheets.reportAllSheetsHint', { count: sortedSheets.length })}
          </p>
        )}

        {mode === 'period' && noSheets && (
          <p className="text-xs text-amber-700 mb-6">{t('routingSheets.reportEmptyList')}</p>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            size="small"
            color="primary"
            className="flex-1"
            onClick={() => void handleGenerate()}
            disabled={loading || noSheets}
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
