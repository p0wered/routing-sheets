import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import type { User } from '../../types/auth';
import { USER_ROLE_KEYS } from '../../types/auth';
import type { NamedReference } from '../../types/references';
import { Modal } from '../ui/Modal';
import { TextInput } from '../ui/TextInput';
import { Select, type SelectOption } from '../ui/DropdownSelector';
import { Button } from '../ui/Button';

interface FieldErrors {
  username?: string;
  password?: string;
  fullName?: string;
  role?: string;
  guildId?: string;
}

export interface UserFormData {
  username: string;
  password: string;
  fullName: string;
  role: string;
  guildId: number | null;
}

interface UserModalProps {
  isOpen: boolean;
  user: User | null;
  currentUserId: number;
  guilds: NamedReference[];
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
}

export function UserModal({
  isOpen,
  user,
  currentUserId,
  guilds,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: UserModalProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [guildId, setGuildId] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  const roleOptions: SelectOption<string>[] = useMemo(
    () =>
      USER_ROLE_KEYS.map((value) => ({
        value,
        label: t(`roles.${value}`),
      })),
    [t]
  );

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setUsername(user?.username ?? '');
      setPassword('');
      setFullName(user?.fullName ?? '');
      setRole(user?.role ?? null);
      setGuildId(user?.guildId ?? null);
      setFieldErrors({});
    }
  }

  const isEditing = !!user;
  const isSelf = isEditing && user.id === currentUserId;
  const guildRequired = role === 'WorkshopChief' || role === 'WorkshopForeman';

  const handleSubmit = () => {
    const errors: FieldErrors = {};

    if (!username.trim()) {
      errors.username = t('users.errorUsername');
    }

    if (!fullName.trim()) {
      errors.fullName = t('users.errorFullName');
    }

    if (!isEditing && (!password || password.length < 4)) {
      errors.password = password
        ? t('users.errorPasswordShort')
        : t('users.errorPasswordRequired');
    }

    if (!role) {
      errors.role = t('users.errorRole');
    }

    if (guildRequired && !guildId) {
      errors.guildId = t('users.errorGuild');
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    onSubmit({
      username: username.trim(),
      password,
      fullName: fullName.trim(),
      role: role!,
      guildId: guildRequired ? guildId! : null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t('users.modalEditTitle') : t('users.modalCreateTitle')}
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <TextInput
          id="user-username"
          label={t('users.labelLogin')}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('users.placeholderLogin')}
          error={fieldErrors.username}
        />

        <TextInput
          id="user-fullName"
          label={t('users.labelFullName')}
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t('users.placeholderFullName')}
          error={fieldErrors.fullName}
        />

        <TextInput
          id="user-password"
          label={t('users.labelPassword')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isEditing ? t('users.placeholderPasswordEdit') : t('users.placeholderPassword')}
          error={fieldErrors.password}
        />

        <div>
          <label className="ml-1.5 block text-sm font-medium text-gray-700 mb-1.5">
            {t('users.labelRole')}
          </label>
          <Select
            value={role}
            onChange={(v) => {
              setRole(v);
              if (v === 'PlanningDept') setGuildId(null);
            }}
            options={roleOptions}
            placeholder={t('users.placeholderRole')}
            className="w-full"
            disabled={isSelf}
          />
          {fieldErrors.role && (
            <p className="ml-1.5 mt-1.5 text-sm text-error">
              {fieldErrors.role}
            </p>
          )}
        </div>

        <div>
          <label className="ml-1.5 block text-sm font-medium text-gray-700 mb-1.5">
            {t('users.labelGuild')}
          </label>
          <Select<number>
            value={guildId}
            onChange={setGuildId}
            options={guilds.map((g) => ({ value: g.id, label: g.name }))}
            placeholder={guildRequired ? t('users.placeholderGuild') : t('users.placeholderGuildOptional')}
            className="w-full"
            disabled={!guildRequired}
          />
          {fieldErrors.guildId && (
            <p className="ml-1.5 mt-1.5 text-sm text-error">
              {fieldErrors.guildId}
            </p>
          )}
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
          {isSubmitting ? t('common.saving') : t('common.save')}
        </Button>

        <Button
          type="button"
          size="small"
          color="secondary"
          className="w-full"
          onClick={onClose}
          disabled={isSubmitting}
        >
          {t('common.cancel')}
        </Button>
      </div>
    </Modal>
  );
}
