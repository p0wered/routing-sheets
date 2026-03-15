import { useState } from 'react';
import { Save } from 'lucide-react';
import type { User } from '../types/auth';
import { ROLE_LABELS } from '../types/auth';
import type { NamedReference } from '../types/references';
import { Modal } from './Modal';
import { TextInput } from './TextInput';
import { Select, type SelectOption } from './DropdownSelector';
import { Button } from './Button';

const roleOptions: SelectOption<string>[] = Object.entries(ROLE_LABELS).map(
  ([value, label]) => ({ value, label })
);

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [guildId, setGuildId] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [prevIsOpen, setPrevIsOpen] = useState(false);

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
      errors.username = 'Укажите логин';
    }

    if (!fullName.trim()) {
      errors.fullName = 'Укажите ФИО';
    }

    if (!isEditing && (!password || password.length < 4)) {
      errors.password = password
        ? 'Пароль должен содержать минимум 4 символа'
        : 'Укажите пароль';
    }

    if (!role) {
      errors.role = 'Выберите роль';
    }

    if (guildRequired && !guildId) {
      errors.guildId = 'Для этой роли необходимо указать цех';
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
      title={isEditing ? 'Редактировать пользователя' : 'Новый пользователь'}
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <TextInput
          id="user-username"
          label="Логин"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Введите логин"
          error={fieldErrors.username}
        />

        <TextInput
          id="user-fullName"
          label="ФИО"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Введите ФИО"
          error={fieldErrors.fullName}
        />

        <TextInput
          id="user-password"
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isEditing ? '••••••••' : 'Введите пароль'}
          error={fieldErrors.password}
        />

        <div>
          <label className="ml-1.5 block text-sm font-medium text-gray-700 mb-1.5">
            Роль
          </label>
          <Select
            value={role}
            onChange={(v) => {
              setRole(v);
              if (v === 'PlanningDept') setGuildId(null);
            }}
            options={roleOptions}
            placeholder="Выберите роль"
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
            Цех
          </label>
          <Select<number>
            value={guildId}
            onChange={setGuildId}
            options={guilds.map((g) => ({ value: g.id, label: g.name }))}
            placeholder={guildRequired ? 'Выберите цех' : '—'}
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
