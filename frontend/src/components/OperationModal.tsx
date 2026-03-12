import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { Modal } from './Modal';
import { TextInput } from './TextInput';
import { Select } from './DropdownSelector';
import { Button } from './Button';
import { guildsApi, operationTypesApi, performersApi } from '../api/references';
import { getOperationStatuses } from '../api/operations';
import type { OperationListItem } from '../types/routingSheet';

interface OperationFormValues {
  code: string;
  name: string;
  guildId: number | null;
  operationTypeId: number | null;
  performerId: number | null;
  statusId: number | null;
  price: string;
  quantity: string;
}

interface OperationModalProps {
  isOpen: boolean;
  editingOp: OperationListItem | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: {
    code: string | null;
    name: string;
    guildId: number | null;
    operationTypeId: number | null;
    performerId: number | null;
    statusId: number | null;
    price: number | null;
    sum: number | null;
    quantity: number;
  }) => void;
}

const EMPTY_FORM: OperationFormValues = {
  code: '',
  name: '',
  guildId: null,
  operationTypeId: null,
  performerId: null,
  statusId: null,
  price: '',
  quantity: '',
};

export function OperationModal({
  isOpen,
  editingOp,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: OperationModalProps) {
  const [form, setForm] = useState<OperationFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  const { data: guilds, isLoading: isGuildsLoading } = useQuery({
    queryKey: ['guilds'],
    queryFn: guildsApi.getAll,
    enabled: isOpen,
  });

  const { data: opTypes, isLoading: isOpTypesLoading } = useQuery({
    queryKey: ['operationTypes'],
    queryFn: operationTypesApi.getAll,
    enabled: isOpen,
  });

  const { data: performers, isLoading: isPerformersLoading } = useQuery({
    queryKey: ['performers'],
    queryFn: performersApi.getAll,
    enabled: isOpen,
  });

  const { data: opStatuses, isLoading: isStatusesLoading } = useQuery({
    queryKey: ['operationStatuses'],
    queryFn: getOperationStatuses,
    enabled: isOpen,
  });

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      if (editingOp) {
        setForm({
          code: editingOp.code ?? '',
          name: editingOp.name,
          guildId: editingOp.guildId,
          operationTypeId: editingOp.operationTypeId,
          performerId: editingOp.performerId,
          statusId: editingOp.statusId,
          price: editingOp.price != null ? String(editingOp.price) : '',
          quantity: String(editingOp.quantity),
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setFieldErrors({});
    }
  }

  const computedSum = (() => {
    const q = Number(form.quantity);
    const p = Number(form.price);
    if (form.quantity.trim() && form.price.trim() && !Number.isNaN(q) && !Number.isNaN(p))
      return (q * p).toFixed(2);
    return '';
  })();

  const handleSubmit = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Укажите наименование операции';
    const qty = Number(form.quantity);
    if (!form.quantity.trim() || Number.isNaN(qty) || qty < 0) {
      errors.quantity = 'Укажите корректное количество';
    }
    const price = form.price.trim() ? Number(form.price) : null;
    if (form.price.trim() && (Number.isNaN(price) || (price !== null && price < 0))) {
      errors.price = 'Укажите корректную цену';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const sum = computedSum ? Number(computedSum) : null;

    setFieldErrors({});
    onSubmit({
      code: form.code.trim() || null,
      name: form.name.trim(),
      guildId: form.guildId,
      operationTypeId: form.operationTypeId,
      performerId: form.performerId,
      statusId: form.statusId,
      price,
      sum,
      quantity: qty,
    });
  };

  const title = editingOp ? 'Редактировать операцию' : 'Новая операция';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <TextInput
          id="op-code"
          label="Код операции"
          type="text"
          value={form.code}
          onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
          placeholder="Например, 010"
        />

        <TextInput
          id="op-name"
          label="Наименование"
          type="text"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Наименование операции"
          error={fieldErrors.name}
        />

        <div>
          <label className="ml-1.5 block text-sm font-medium text-gray-700 mb-1.5">
            Тип операции
          </label>
          <Select<number>
            value={form.operationTypeId}
            onChange={(val) => setForm((prev) => ({ ...prev, operationTypeId: val }))}
            options={opTypes?.map((t) => ({ value: t.id, label: t.name })) ?? []}
            placeholder="Выберите тип"
            isLoading={isOpTypesLoading}
          />
        </div>

        <div>
          <label className="ml-1.5 block text-sm font-medium text-gray-700 mb-1.5">
            Цех
          </label>
          <Select<number>
            value={form.guildId}
            onChange={(val) => setForm((prev) => ({ ...prev, guildId: val }))}
            options={guilds?.map((g) => ({ value: g.id, label: g.name })) ?? []}
            placeholder="Выберите цех"
            isLoading={isGuildsLoading}
          />
        </div>

        <div>
          <label className="ml-1.5 block text-sm font-medium text-gray-700 mb-1.5">
            Исполнитель
          </label>
          <Select<number>
            value={form.performerId ?? 0}
            onChange={(val) => setForm((prev) => ({ ...prev, performerId: val === 0 ? null : val }))}
            options={[
              { value: 0, label: 'Без исполнителя' },
              ...(performers?.map((p) => ({ value: p.id, label: p.fullName })) ?? []),
            ]}
            placeholder="Выберите исполнителя"
            isLoading={isPerformersLoading}
          />
        </div>

        {editingOp && (
          <div>
            <label className="ml-1.5 block text-sm font-medium text-gray-700 mb-1.5">
              Статус
            </label>
            <Select<number>
              value={form.statusId}
              onChange={(val) => setForm((prev) => ({ ...prev, statusId: val }))}
              options={opStatuses?.map((s) => ({ value: s.id, label: s.name })) ?? []}
              placeholder="Выберите статус"
              isLoading={isStatusesLoading}
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <TextInput
            id="op-quantity"
            label="Кол-во"
            type="number"
            min={0}
            value={form.quantity}
            onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
            placeholder="0"
            error={fieldErrors.quantity}
          />
          <TextInput
            id="op-price"
            label="Цена"
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            placeholder="0.00"
            error={fieldErrors.price}
          />
          <div>
            <label
              htmlFor="op-sum"
              className="ml-1.5 block text-sm font-medium text-gray-700 mb-1.5"
            >
              Сумма
            </label>
            <input
              id="op-sum"
              type="text"
              readOnly
              value={computedSum || '—'}
              className="w-full px-3 py-2.5 text-sm rounded-xl text-gray-900 border border-gray-200 bg-gray-50 cursor-default focus:outline-none"
              tabIndex={-1}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          size="small"
          color="primary"
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting}
          icon={<Save />}
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
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
