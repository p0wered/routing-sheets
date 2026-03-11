import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../types/auth';
import type { User } from '../types/auth';
import { RoutingHeader } from '../components/Header';
import { Button } from '../components/Button';
import { UserModal } from '../components/UserModal';
import { Spinner } from '../components/Spinner';
import { getUsers, createUser, updateUser, deleteUser } from '../api/users';
import { Pencil, Trash2, ChevronLeft, UserPlus, X } from 'lucide-react';

export default function UsersPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
    onError: (error: unknown) => {
      setModalError(extractError(error, 'Не удалось создать пользователя'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateUser>[1] }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
    onError: (error: unknown) => {
      setModalError(extractError(error, 'Не удалось обновить пользователя'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeletingId(null);
    },
  });

  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

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

  const workshopChiefId = users?.find((u) => u.role === 'WorkshopChief')?.id ?? null;

  const disabledRoles =
    workshopChiefId !== null && workshopChiefId !== editingUser?.id
      ? ['WorkshopChief']
      : [];

  function handleSubmit(data: { username: string; password: string; role: string }) {
    setModalError(null);

    if (disabledRoles.includes(data.role)) {
      setModalError('Начальник цеха может быть только один');
      return;
    }

    if (editingUser) {
      updateMutation.mutate({
        id: editingUser.id,
        data: {
          username: data.username.trim(),
          password: data.password || undefined,
          role: data.role,
        },
      });
    } else {
      createMutation.mutate({
        username: data.username.trim(),
        password: data.password,
        role: data.role,
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <section className="bg-white rounded-3xl shadow-lg/5 border border-gray-200 p-3 mb-3">
          <div className="flex items-center justify-between">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-1 hover:text-primary transition cursor-pointer"
            >
              <ChevronLeft
                className="w-5 h-5"
                strokeWidth={1.5}
              />
              <p className="text-base">
                На главную
              </p>
            </div>
            <Button type="button" size="small" color="primary" onClick={openCreate} icon={<UserPlus />}>
              Добавить пользователя
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
              Пользователи не найдены
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-6 py-3 font-semibold text-gray-600">Логин</th>
                  <th className="px-6 py-3 font-semibold text-gray-600">Роль</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 text-right">
                    Действия
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
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-primary/8 hover:text-primary transition cursor-pointer"
                          onClick={() => openEdit(u)}
                          title="Редактировать"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-red-50 hover:text-error transition cursor-pointer"
                          onClick={() => handleDelete(u.id)}
                          title="Удалить"
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
        isSubmitting={isSubmitting}
        error={modalError}
        disabledRoles={disabledRoles}
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
              Удаление пользователя
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Вы уверены, что хотите удалить этого пользователя? Это действие
              нельзя отменить.
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
                {deleteMutation.isPending ? 'Удаление...' : 'Удалить'}
              </Button>
              <Button
                type="button"
                size="small"
                color="secondary"
                className="w-full"
                onClick={() => setDeletingId(null)}
                disabled={deleteMutation.isPending}
                icon={<X />}
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function extractError(error: unknown, fallback: string): string {
  const axiosError = error as { response?: { data?: string | { message?: string } } };
  if (typeof axiosError.response?.data === 'string') {
    return axiosError.response.data;
  }
  if (typeof axiosError.response?.data === 'object' && axiosError.response.data?.message) {
    return axiosError.response.data.message;
  }
  return fallback;
}
