import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { Modal } from './Modal';
import { TextInput } from './TextInput';
import { Select } from './DropdownSelector';
import { Button } from './Button';
import { getProductItems, getUnits } from '../api/routingSheets';
import { getPlanPositions } from '../api/planPositions';
import type { RoutingSheetListItem } from '../types/routingSheet';

interface RoutingSheetFormValues {
  number: string;
  name: string;
  planPositionId: number | null;
  productItemId: number | null;
  unitId: number | null;
  quantity: string;
}

interface RoutingSheetModalProps {
  isOpen: boolean;
  editingSheet: RoutingSheetListItem | null;
  defaultPlanPositionId: number | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: {
    number: string;
    name: string;
    planPositionId: number | null;
    productItemId: number | null;
    unitId: number | null;
    quantity: number;
  }) => void;
}

const EMPTY_FORM: RoutingSheetFormValues = {
  number: '',
  name: '',
  planPositionId: null,
  productItemId: null,
  unitId: null,
  quantity: '',
};

export function RoutingSheetModal({
  isOpen,
  editingSheet,
  defaultPlanPositionId,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: RoutingSheetModalProps) {
  const [form, setForm] = useState<RoutingSheetFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  const { data: productItems, isLoading: isProductItemsLoading } = useQuery({
    queryKey: ['productItems'],
    queryFn: getProductItems,
    enabled: isOpen,
  });

  const { data: units, isLoading: isUnitsLoading } = useQuery({
    queryKey: ['units-for-rs'],
    queryFn: getUnits,
    enabled: isOpen,
  });

  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['planPositions'],
    queryFn: getPlanPositions,
    enabled: isOpen,
  });

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      if (editingSheet) {
        setForm({
          number: editingSheet.number,
          name: editingSheet.name,
          planPositionId: editingSheet.planPositionId,
          productItemId: editingSheet.productItemId,
          unitId: null,
          quantity: String(editingSheet.quantity),
        });
      } else {
        setForm({
          ...EMPTY_FORM,
          planPositionId: defaultPlanPositionId,
        });
      }
      setFieldErrors({});
    }
  }

  const handleSubmit = () => {
    const errors: Record<string, string> = {};

    if (!form.number.trim()) errors.number = 'Укажите номер МЛ';
    if (!form.name.trim()) errors.name = 'Укажите наименование';
    const qty = Number(form.quantity);
    if (!form.quantity.trim() || Number.isNaN(qty) || qty < 0) {
      errors.quantity = 'Укажите корректное количество';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    onSubmit({
      number: form.number.trim(),
      name: form.name.trim(),
      planPositionId: form.planPositionId,
      productItemId: form.productItemId,
      unitId: form.unitId,
      quantity: qty,
    });
  };

  const title = editingSheet ? 'Редактировать маршрутный лист' : 'Новый маршрутный лист';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <TextInput
          id="rs-number"
          label="Номер МЛ"
          type="text"
          value={form.number}
          onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))}
          placeholder="Например, МЛ-2026-0001"
          error={fieldErrors.number}
        />

        <TextInput
          id="rs-name"
          label="Наименование"
          type="text"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Наименование маршрутного листа"
          error={fieldErrors.name}
        />

        <div>
          <label className="ml-1.5 block text-sm font-medium text-gray-700 mb-1.5">
            Позиция плана
          </label>
          <Select<number>
            value={form.planPositionId}
            onChange={(val) => setForm((prev) => ({ ...prev, planPositionId: val }))}
            options={
              plans?.map((p) => ({ value: p.id, label: p.name })) ?? []
            }
            placeholder="Выберите позицию плана"
            isLoading={isPlansLoading}
          />
        </div>

        <div>
          <label className="ml-1.5 block text-sm font-medium text-gray-700 mb-1.5">
            Изделие
          </label>
          <Select<number>
            value={form.productItemId}
            onChange={(val) => setForm((prev) => ({ ...prev, productItemId: val }))}
            options={
              productItems?.map((p) => ({ value: p.id, label: p.name })) ?? []
            }
            placeholder="Выберите изделие"
            isLoading={isProductItemsLoading}
          />
        </div>

        <div>
          <label className="ml-1.5 block text-sm font-medium text-gray-700 mb-1.5">
            Единица измерения
          </label>
          <Select<number>
            value={form.unitId}
            onChange={(val) => setForm((prev) => ({ ...prev, unitId: val }))}
            options={
              units?.map((u) => ({ value: u.id, label: u.name })) ?? []
            }
            placeholder="Выберите ед. измерения"
            isLoading={isUnitsLoading}
          />
        </div>

        <TextInput
          id="rs-quantity"
          label="Количество"
          type="number"
          min={0}
          value={form.quantity}
          onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
          placeholder="0"
          error={fieldErrors.quantity}
        />
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
