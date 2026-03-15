import { useState } from 'react';
import { Scissors } from 'lucide-react';
import { Modal } from './Modal';
import { TextInput } from './TextInput';
import { Button } from './Button';

interface SplitQuantityModalProps {
  isOpen: boolean;
  title: string;
  currentQuantity: number;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (splitQuantity: number) => void;
}

export function SplitQuantityModal({
  isOpen,
  title,
  currentQuantity,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: SplitQuantityModalProps) {
  const [value, setValue] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setValue('');
      setFieldError(null);
    }
  }

  const splitQty = Number(value);
  const remaining = currentQuantity - (Number.isNaN(splitQty) ? 0 : splitQty);

  const handleSubmit = () => {
    const qty = Number(value);
    if (!value.trim() || Number.isNaN(qty) || !Number.isInteger(qty)) {
      setFieldError('Введите целое число');
      return;
    }
    if (qty <= 0) {
      setFieldError('Количество должно быть больше 0');
      return;
    }
    if (qty >= currentQuantity) {
      setFieldError(`Количество должно быть меньше ${currentQuantity}`);
      return;
    }
    setFieldError(null);
    onSubmit(qty);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="bg-gray-50 rounded-xl px-4 py-3">
          <p className="text-sm text-gray-600">
            Текущее количество: <span className="font-semibold text-gray-900">{currentQuantity}</span>
          </p>
          {value && !Number.isNaN(splitQty) && splitQty > 0 && splitQty < currentQuantity && (
            <p className="text-sm text-gray-600 mt-1">
              Будет: <span className="font-semibold text-gray-900">{remaining}</span>
              {' и '}
              <span className="font-semibold text-primary">{splitQty}</span>
            </p>
          )}
        </div>

        <TextInput
          id="split-quantity"
          label="Количество для отделения"
          type="number"
          min={1}
          max={currentQuantity - 1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setFieldError(null);
          }}
          placeholder={`1 – ${currentQuantity - 1}`}
          error={fieldError ?? undefined}
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
