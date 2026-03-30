import pdfMake from 'pdfmake/build/pdfmake';
import vfs from 'pdfmake/build/vfs_fonts';
import type { RoutingSheetDetail, RoutingSheetListItem } from '../types/routingSheet';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(pdfMake as any).vfs = vfs;

function formatDateTime(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' });
}

function formatDateOnly(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale);
}

export interface SingleSheetPdfLabels {
  title: string;
  subtitleMeta: string;
  fieldNumber: string;
  fieldName: string;
  fieldStatus: string;
  fieldProduct: string;
  fieldUnit: string;
  fieldQuantity: string;
  fieldCreated: string;
  fieldUpdated: string;
  sectionPlan: string;
  fieldPlanCode: string;
  fieldPlanMonth: string;
  fieldGuild: string;
  sectionOperations: string;
  colSeq: string;
  colCode: string;
  colName: string;
  colType: string;
  colGuild: string;
  colQty: string;
  colPrice: string;
  colSum: string;
  colStatus: string;
  colPerformer: string;
  emptyDash: string;
}

export interface PeriodPdfLabels {
  title: string;
  periodLine: string;
  sheetCount: string;
  colNumber: string;
  colName: string;
  colProduct: string;
  colUnit: string;
  colQty: string;
  colStatus: string;
  colCreated: string;
  emptyDash: string;
}

function buildSingleSheetDoc(sheet: RoutingSheetDetail, labels: SingleSheetPdfLabels, locale: string) {
  const metaRows = [
    {
      columns: [
        { text: `${labels.fieldNumber}: ${sheet.number}`, width: '*' },
        { text: `${labels.fieldCreated}: ${formatDateTime(sheet.createdAt, locale)}`, width: 'auto' },
      ],
      margin: [0, 0, 0, 4],
    },
    {
      text: `${labels.fieldName}: ${sheet.name}`,
      margin: [0, 0, 0, 4],
    },
    {
      columns: [
        {
          text: `${labels.fieldStatus}: ${sheet.status?.name ?? labels.emptyDash}`,
          width: '*',
        },
        {
          text: `${labels.fieldQuantity}: ${sheet.quantity}`,
          width: 'auto',
        },
      ],
      margin: [0, 0, 0, 4],
    },
  ];

  if (sheet.productItem?.name || sheet.unit?.name) {
    metaRows.push({
      columns: [
        {
          text: `${labels.fieldProduct}: ${sheet.productItem?.name ?? labels.emptyDash}`,
          width: '*',
        },
        {
          text: `${labels.fieldUnit}: ${sheet.unit?.name ?? labels.emptyDash}`,
          width: 'auto',
        },
      ],
      margin: [0, 0, 0, 4],
    });
  }

  if (sheet.updatedAt) {
    metaRows.push({
      text: `${labels.fieldUpdated}: ${formatDateTime(sheet.updatedAt, locale)}`,
      margin: [0, 0, 0, 8],
    });
  } else {
    metaRows.push({ text: '', margin: [0, 0, 0, 8] });
  }

  const plan = sheet.planPosition;
  const planBlock = plan
    ? [
        { text: labels.sectionPlan, style: 'subheader', margin: [0, 8, 0, 6] },
        {
          text: `${labels.fieldPlanCode}: ${plan.positionCode} — ${plan.name}`,
          margin: [0, 0, 0, 4],
        },
        {
          text: `${labels.fieldPlanMonth}: ${plan.planMonth}/${plan.planYear}`,
          margin: [0, 0, 0, 4],
        },
        {
          text: `${labels.fieldGuild}: ${plan.guildName ?? labels.emptyDash}`,
          margin: [0, 0, 0, 8],
        },
      ]
    : [];

  const ops = sheet.operations ?? [];
  const opHeader = [
    labels.colSeq,
    labels.colCode,
    labels.colName,
    labels.colType,
    labels.colGuild,
    labels.colQty,
    labels.colPrice,
    labels.colSum,
    labels.colStatus,
    labels.colPerformer,
  ];
  const opBody: (string | number)[][] = [
    opHeader,
    ...ops.map((o) => [
      o.seqNumber,
      o.code ?? labels.emptyDash,
      o.name,
      o.operationType?.name ?? labels.emptyDash,
      o.guild?.name ?? labels.emptyDash,
      o.quantity,
      o.price ?? labels.emptyDash,
      o.sum ?? labels.emptyDash,
      o.status?.name ?? labels.emptyDash,
      o.performer?.fullName ?? labels.emptyDash,
    ]),
  ];

  const content = [
    { text: `${labels.title} ${sheet.number}`, style: 'header' },
    { text: labels.subtitleMeta, style: 'sub', margin: [0, 4, 0, 12] },
    ...metaRows,
    ...planBlock,
    { text: labels.sectionOperations, style: 'subheader', margin: [0, 8, 0, 6] },
    {
      table: {
        headerRows: 1,
        widths: [22, 36, '*', 50, 50, 32, 36, 36, 44, 52],
        body: opBody,
      },
      layout: 'lightHorizontalLines',
      fontSize: 7,
    },
  ];

  return {
    pageOrientation: 'landscape',
    pageMargins: [36, 40, 36, 40],
    defaultStyle: { font: 'Roboto', fontSize: 9 },
    styles: {
      header: { fontSize: 14, bold: true },
      sub: { fontSize: 9, color: '#444444' },
      subheader: { fontSize: 11, bold: true },
    },
    content,
  };
}

export function openSingleRoutingSheetPdf(
  sheet: RoutingSheetDetail,
  labels: SingleSheetPdfLabels,
  locale: string,
): void {
  const doc = buildSingleSheetDoc(sheet, labels, locale);
  pdfMake.createPdf(doc).open();
}

function buildPeriodDoc(
  items: RoutingSheetListItem[],
  periodDisplay: string,
  labels: PeriodPdfLabels,
  locale: string,
) {
  const header = [
    labels.colNumber,
    labels.colName,
    labels.colProduct,
    labels.colUnit,
    labels.colQty,
    labels.colStatus,
    labels.colCreated,
  ];
  const body: (string | number)[][] = [
    header,
    ...items.map((rs) => [
      rs.number,
      rs.name,
      rs.productItemName ?? labels.emptyDash,
      rs.unitName ?? labels.emptyDash,
      rs.quantity,
      rs.statusName ?? labels.emptyDash,
      formatDateOnly(rs.createdAt, locale),
    ]),
  ];

  return {
    pageOrientation: 'portrait',
    pageMargins: [36, 40, 36, 40],
    defaultStyle: { font: 'Roboto', fontSize: 9 },
    styles: {
      header: { fontSize: 14, bold: true },
      sub: { fontSize: 9, color: '#444444' },
    },
    content: [
      { text: labels.title, style: 'header' },
      {
        text: `${labels.periodLine}: ${periodDisplay}`,
        style: 'sub',
        margin: [0, 6, 0, 4],
      },
      {
        text: labels.sheetCount,
        margin: [0, 0, 0, 12],
      },
      {
        table: {
          headerRows: 1,
          widths: [56, '*', '*', 36, 36, 56, 56],
          body,
        },
        layout: 'lightHorizontalLines',
      },
    ],
  };
}

/** periodDisplay — подпись периода планов (например «Февраль 2026»), как в календаре на странице */
export function openPeriodRoutingSheetsPdf(
  items: RoutingSheetListItem[],
  periodDisplay: string,
  labels: PeriodPdfLabels,
  locale: string,
): void {
  const doc = buildPeriodDoc(items, periodDisplay, labels, locale);
  pdfMake.createPdf(doc).open();
}
