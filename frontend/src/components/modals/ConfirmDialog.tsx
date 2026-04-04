import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  confirmLoadingLabel?: string;
  confirmColor?: 'primary' | 'error';
  confirmIcon?: ReactNode;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmLoadingLabel,
  confirmColor = 'error',
  confirmIcon,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-xs"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl shadow-xl/5 w-full max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button
            type="button"
            size="small"
            color={confirmColor}
            className="w-full"
            onClick={onConfirm}
            disabled={isLoading}
            icon={confirmIcon}
          >
            {isLoading ? (confirmLoadingLabel ?? confirmLabel) : confirmLabel}
          </Button>
          <Button
            type="button"
            size="small"
            color="secondary"
            className="w-full"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
