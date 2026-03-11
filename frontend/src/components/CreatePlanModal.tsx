import { useState } from 'react';
import { Save, X } from 'lucide-react';
import type { CreatePlanFormState } from '../types/plan';
import { Button } from './Button';
import { Modal } from './Modal';
import { TextInput } from './TextInput';

interface FieldErrors {
  documentNumber?: string;
  documentDate?: string;
}

interface CreatePlanModalProps {
  isOpen: boolean;
  form: CreatePlanFormState;
  formError: string | null;
  isSubmitting: boolean;
  onFieldChange: (field: keyof CreatePlanFormState, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function CreatePlanModal({
  isOpen,
  form,
  formError,
  isSubmitting,
  onFieldChange,
  onClose,
  onSubmit,
}: CreatePlanModalProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setFieldErrors({});
    }
  }

  const handleSubmit = () => {
    const errors: FieldErrors = {};

    if (!form.documentNumber.trim()) {
      errors.documentNumber = 'Укажите номер документа';
    }

    if (!form.documentDate) {
      errors.documentDate = 'Укажите дату документа';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    onSubmit();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Новый план производства"
    >
      <div className="space-y-4">
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
            {formError}
          </div>
        )}

        <TextInput
          id="documentNumber"
          label="Номер документа"
          type="text"
          value={form.documentNumber}
          onChange={(e) => onFieldChange('documentNumber', e.target.value)}
          placeholder="Например, ПП-2026-001"
          error={fieldErrors.documentNumber}
        />

        <div>
          <TextInput
            id="documentDate"
            label="Дата документа"
            type="date"
            value={form.documentDate}
            onChange={(e) => onFieldChange('documentDate', e.target.value)}
            error={fieldErrors.documentDate}
          />
          <p className="mt-1 text-xs text-gray-400">
            Хранится без времени, отображается в формате ДД.ММ.ГГГГ.
          </p>
        </div>

        <TextInput
          id="planningPeriod"
          label="Период планирования"
          type="text"
          value={form.planningPeriod}
          onChange={(e) => onFieldChange('planningPeriod', e.target.value)}
          placeholder='Например, "Март 2026" или "2 квартал 2026"'
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

