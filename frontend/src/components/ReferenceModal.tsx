import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Modal } from './Modal';
import { TextInput } from './TextInput';
import { Button } from './Button';

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
}

interface ReferenceModalProps {
  isOpen: boolean;
  title: string;
  fields: FieldConfig[];
  initialValues?: Record<string, string>;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
}

export function ReferenceModal({
  isOpen,
  title,
  fields,
  initialValues,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: ReferenceModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      const init: Record<string, string> = {};
      for (const f of fields) {
        init[f.key] = initialValues?.[f.key] ?? '';
      }
      setValues(init);
      setFieldErrors({});
    }
  }

  const handleSubmit = () => {
    const errors: Record<string, string> = {};
    for (const f of fields) {
      if (f.required !== false && !values[f.key]?.trim()) {
        errors[f.key] = `Заполните поле «${f.label}»`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    onSubmit(values);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {fields.map((f) => (
          <TextInput
            key={f.key}
            id={`ref-${f.key}`}
            label={f.label}
            type="text"
            value={values[f.key] ?? ''}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, [f.key]: e.target.value }))
            }
            placeholder={f.placeholder}
            error={fieldErrors[f.key]}
          />
        ))}
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
          icon={<X />}
        >
          Отмена
        </Button>
      </div>
    </Modal>
  );
}
