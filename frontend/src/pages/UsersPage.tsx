import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useRoleLabel } from '../hooks/useRoleLabel';
import type { User } from '../types/auth';
import type { UserFormData } from '../components/UserModal';
import { RoutingHeader } from '../components/Header';
import { Button } from '../components/Button';
import { UserModal } from '../components/UserModal';
import { Spinner } from '../components/Spinner';
import { getUsers, createUser, updateUser, deleteUser } from '../api/users';
import { guildsApi } from '../api/references';
import { toast, extractError } from '../utils/toast';
import { Pencil, Trash2, UserPlus } from 'lucide-react';

export default function UsersPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const roleLabel = useRoleLabel(user?.role ?? '');
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const { data: guilds = [] } = useQuery({
    queryKey: ['guilds'],
    queryFn: guildsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
      toast.success(t('users.toastCreated'));
    },
    onError: (error: unknown) => {
      const msg = extractError(error, t('users.toastCreateFailed'));
      setModalError(msg);
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateUser>[1] }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
      toast.success(t('users.toastUpdated'));
    },
    onError: (error: unknown) => {
      const msg = extractError(error, t('users.toastUpdateFailed'));
      setModalError(msg);
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeletingId(null);
      toast.success(t('users.toastDeleted'));
    },
    onError: (error: unknown) => {
      setDeletingId(null);
      toast.error(extractError(error, t('users.toastDeleteFailed')));
    },
  });

  if (!user) return null;

  function openCreate() {
    setEditingUser(null);
    setModalError(null);
    setIsModalOpen(true);
  }

  function openEdit(u: User) {
    setEditingUser(u);
    setModalError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingUser(null);
    setModalError(null);
  }

  function chiefExistsInGuild(guildId: number, excludeUserId?: number): boolean {
    return (
      users?.some(
        (u) =>
          u.role === 'WorkshopChief' &&
          u.guildId === guildId &&
          u.id !== excludeUserId
      ) ?? false
    );
  }

  function handleSubmit(data: UserFormData) {
    setModalError(null);

    if (
      data.role === 'WorkshopChief' &&
      data.guildId !== null &&
      chiefExistsInGuild(data.guildId, editingUser?.id)
    ) {
      setModalError(t('users.chiefExistsInGuild'));
      return;
    }

    if (editingUser) {
      updateMutation.mutate({
        id: editingUser.id,
        data: {
          username: data.username,
          fullName: data.fullName,
          password: data.password || undefined,
          role: data.role,
          guildId: data.guildId,
        },
      });
    } else {
      createMutation.mutate({
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        role: data.role,
        guildId: data.guildId,
      });
    }
  }

  function handleDelete(id: number) {
    setDeletingId(id);
  }

  function confirmDelete() {
    if (deletingId !== null) {
      deleteMutation.mutate(deletingId);
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      <RoutingHeader user={user} roleLabel={roleLabel} onLogout={logout} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <section className="bg-white rounded-3xl shadow-lg/5 border border-gray-200 p-3 mb-3">
          <div className="flex items-center justify-between">
            <p className="pl-3 text-base font-bold">
              {t('users.title')}
            </p>
            <Button type="button" size="small" color="primary" onClick={openCreate} icon={<UserPlus />}>
              {t('users.addUser')}
            </Button>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-lg/5 border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-6 flex justify-center">
              <Spinner />
            </div>
          ) : !users?.length ? (
            <div className="p-6 text-center text-sm text-gray-500">
              {t('users.empty')}
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-6 py-3 font-semibold text-gray-600">{t('users.colLogin')}</th>
                  <th className="px-6 py-3 font-semibold text-gray-600">{t('users.colRole')}</th>
                  <th className="px-6 py-3 font-semibold text-gray-600">{t('users.colGuild')}</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 text-right">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {u.username}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="inline-block bg-primary/8 text-primary rounded-lg px-2.5 py-1 text-xs font-semibold">
                        {t(`roles.${u.role}`, { defaultValue: u.role })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {u.guildName ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-primary/8 hover:text-primary transition cursor-pointer"
                          onClick={() => openEdit(u)}
                          title={t('common.edit')}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-red-50 hover:text-error transition cursor-pointer"
                          onClick={() => handleDelete(u.id)}
                          title={t('common.delete')}
                          disabled={u.id === user.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      <UserModal
        isOpen={isModalOpen}
        user={editingUser}
        currentUserId={user.id}
        guilds={guilds}
        isSubmitting={isSubmitting}
        error={modalError}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      {deletingId !== null && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/40"
          onClick={() => setDeletingId(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-xl/5 w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {t('users.deleteTitle')}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {t('users.deleteMessage')}
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                size="small"
                color="error"
                className="w-full"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                icon={<Trash2 />}
              >
                {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
              </Button>
              <Button
                type="button"
                size="small"
                color="secondary"
                className="w-full"
                onClick={() => setDeletingId(null)}
                disabled={deleteMutation.isPending}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
