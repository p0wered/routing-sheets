import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Scissors } from 'lucide-react';
import { Modal } from './Modal';
import { TextInput } from './TextInput';
import { Button } from './Button';
import { getOperationsByRoutingSheet } from '../api/operations';
import type { RoutingSheetListItem } from '../types/routingSheet';

interface SplitFormValues {
  newNumber: string;
  newName: string;
  newQuantity: string;
  selectedOperationIds: number[];
}

interface SplitRoutingSheetModalProps {
  isOpen: boolean;
  sourceSheet: RoutingSheetListItem | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: {
    operationIds: number[];
    newNumber: string;
    newName: string;
    newQuantity: number;
  }) => void;
}

const EMPTY_FORM: SplitFormValues = {
  newNumber: '',
  newName: '',
  newQuantity: '',
  selectedOperationIds: [],
};

export function SplitRoutingSheetModal({
  isOpen,
  sourceSheet,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: SplitRoutingSheetModalProps) {
  const [form, setForm] = useState<SplitFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  const { data: operations, isLoading: isOpsLoading } = useQuery({
    queryKey: ['operations-for-split', sourceSheet?.id],
    queryFn: () => getOperationsByRoutingSheet(sourceSheet!.id),
    enabled: isOpen && sourceSheet !== null,
  });

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setForm(EMPTY_FORM);
      setFieldErrors({});
    }
  }

  const toggleOperation = (opId: number) => {
    setForm((prev) => {
      const ids = prev.selectedOperationIds.includes(opId)
        ? prev.selectedOperationIds.filter((id) => id !== opId)
        : [...prev.selectedOperationIds, opId];
      return { ...prev, selectedOperationIds: ids };
    });
  };

  const handleSubmit = () => {
    const errors: Record<string, string> = {};
    if (!form.newNumber.trim()) errors.newNumber = 'Укажите номер нового МЛ';
    if (!form.newName.trim()) errors.newName = 'Укажите наименование';
    const qty = Number(form.newQuantity);
    if (!form.newQuantity.trim() || Number.isNaN(qty) || qty < 0) {
      errors.newQuantity = 'Укажите корректное количество';
    }
    if (form.selectedOperationIds.length === 0) {
      errors.operations = 'Выберите хотя бы одну операцию для переноса';
    }
    if (operations && form.selectedOperationIds.length === operations.length) {
      errors.operations = 'Нельзя перенести все операции — оставьте хотя бы одну';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    onSubmit({
      operationIds: form.selectedOperationIds,
      newNumber: form.newNumber.trim(),
      newName: form.newName.trim(),
      newQuantity: qty,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Разбить маршрутный лист${sourceSheet ? ` «${sourceSheet.number}»` : ''}`}
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <p className="text-sm text-gray-600">
          Выберите операции, которые будут перенесены в новый маршрутный лист.
        </p>

        <div>
          <label className="ml-1.5 block text-sm font-medium text-gray-700 mb-1.5">
            Операции для переноса
          </label>
          {isOpsLoading ? (
            <div className="text-sm text-gray-500 py-2">Загрузка операций...</div>
          ) : !operations?.length ? (
            <div className="text-sm text-gray-500 py-2">
              В этом маршрутном листе нет операций
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
              {operations.map((op) => (
                <label
                  key={op.id}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 ${
                    form.selectedOperationIds.includes(op.id)
                      ? 'bg-primary/5'
                      : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.selectedOperationIds.includes(op.id)}
                    onChange={() => toggleOperation(op.id)}
                    className="rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {op.seqNumber}. {op.name}
                    </span>
                    {op.operationTypeName && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({op.operationTypeName})
                      </span>
                    )}
                  </div>
                  {op.statusName && (
                    <span className="text-xs text-gray-500 shrink-0">
                      {op.statusName}
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
          {fieldErrors.operations && (
            <p className="ml-1.5 mt-1.5 text-sm text-error">
              {fieldErrors.operations}
            </p>
          )}
        </div>

        <TextInput
          id="split-number"
          label="Номер нового МЛ"
          type="text"
          value={form.newNumber}
          onChange={(e) => setForm((prev) => ({ ...prev, newNumber: e.target.value }))}
          placeholder="Например, МЛ-2026-0005"
          error={fieldErrors.newNumber}
        />

        <TextInput
          id="split-name"
          label="Наименование нового МЛ"
          type="text"
          value={form.newName}
          onChange={(e) => setForm((prev) => ({ ...prev, newName: e.target.value }))}
          placeholder="Наименование"
          error={fieldErrors.newName}
        />

        <TextInput
          id="split-quantity"
          label="Количество"
          type="number"
          min={0}
          value={form.newQuantity}
          onChange={(e) => setForm((prev) => ({ ...prev, newQuantity: e.target.value }))}
          placeholder="0"
          error={fieldErrors.newQuantity}
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          size="small"
          color="primary"
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting || !operations?.length}
          icon={<Scissors />}
        >
          {isSubmitting ? 'Разбиение...' : 'Разбить'}
        </Button>
        <Button
          type="button"
          size="small"
          color="secondary"
          className="w-full"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Отмена
        </Button>
      </div>
    </Modal>
  );
}
