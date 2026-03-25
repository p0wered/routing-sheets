import { useTranslation } from 'react-i18next';

export function useRoleLabel(role: string): string {
  const { t } = useTranslation();
  if (!role) return '';
  return t(`roles.${role}`, { defaultValue: role });
}
