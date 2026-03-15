import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../types/auth';
import type { NamedReference, Performer, ReferenceTab } from '../types/references';
import { REFERENCE_TAB_LABELS } from '../types/references';
import { RoutingHeader } from '../components/Header';
import { Button } from '../components/Button';
import { ReferenceModal } from '../components/ReferenceModal';
import { Spinner } from '../components/Spinner';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import {
  unitsApi,
  guildsApi,
  operationTypesApi,
  performersApi,
} from '../api/references';
import { toast, extractError } from '../utils/toast';

const TABS: ReferenceTab[] = ['units', 'guilds', 'operationTypes', 'performers'];

const namedApis = {
  units: unitsApi,
  guilds: guildsApi,
  operationTypes: operationTypesApi,
} as const;

type NamedTab = keyof typeof namedApis;

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
}

const NAMED_FIELDS: FieldConfig[] = [
  { key: 'name', label: 'Название', placeholder: 'Введите название' },
];

const PERFORMER_FIELDS: FieldConfig[] = [
  { key: 'fullName', label: 'ФИО', placeholder: 'Введите ФИО' },
  { key: 'role', label: 'Должность', placeholder: 'Введите должность', required: false },
];

function columnsForTab(tab: ReferenceTab) {
  if (tab === 'performers') {
    return [
      { key: 'fullName', label: 'ФИО' },
      { key: 'role', label: 'Должность' },
    ];
  }
  return [{ key: 'name', label: 'Название' }];
}

function fieldsForTab(tab: ReferenceTab) {
  return tab === 'performers' ? PERFORMER_FIELDS : NAMED_FIELDS;
}

function itemToValues(tab: ReferenceTab, item: NamedReference | Performer): Record<string, string> {
  if (tab === 'performers') {
    const p = item as Performer;
    return { fullName: p.fullName, role: p.role ?? '' };
  }
  return { name: (item as NamedReference).name };
}

function cellValue(tab: ReferenceTab, item: NamedReference | Performer, colKey: string): string {
  if (tab === 'performers') {
    const p = item as Performer;
    if (colKey === 'fullName') return p.fullName;
    if (colKey === 'role') return p.role ?? '—';
  }
  return (item as NamedReference).name;
}

export default function ReferencesPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ReferenceTab>('units');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<(NamedReference | Performer) | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const isPerformers = activeTab === 'performers';

  const namedQuery = useQuery<(NamedReference | Performer)[]>({
    queryKey: ['references', activeTab],
    queryFn: async () => {
      if (isPerformers) return performersApi.getAll();
      return namedApis[activeTab as NamedTab].getAll();
    },
  });

  const createMutation = useMutation<NamedReference | Performer, Error, Record<string, string>>({
    mutationFn: async (values: Record<string, string>) => {
      if (isPerformers)
        return performersApi.create({ fullName: values.fullName, role: values.role || null });
      return namedApis[activeTab as NamedTab].create({ name: values.name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['references', activeTab] });
      closeModal();
      toast.success('Запись создана');
    },
    onError: (err: unknown) => {
      const msg = extractError(err, 'Не удалось создать запись');
      setModalError(msg);
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: Record<string, string> }) => {
      if (isPerformers)
        return performersApi.update(id, { fullName: values.fullName, role: values.role || null });
      return namedApis[activeTab as NamedTab].update(id, { name: values.name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['references', activeTab] });
      closeModal();
      toast.success('Запись обновлена');
    },
    onError: (err: unknown) => {
      const msg = extractError(err, 'Не удалось обновить запись');
      setModalError(msg);
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (isPerformers) return performersApi.remove(id);
      return namedApis[activeTab as NamedTab].remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['references', activeTab] });
      setDeletingId(null);
      toast.success('Запись удалена');
    },
    onError: (err: unknown) => {
      setDeletingId(null);
      toast.error(extractError(err, 'Не удалось удалить запись'));
    },
  });

  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
  const items = (namedQuery.data ?? []) as (NamedReference | Performer)[];
  const columns = columnsForTab(activeTab);
  const fields = fieldsForTab(activeTab);

  function openCreate() {
    setEditingItem(null);
    setModalError(null);
    setIsModalOpen(true);
  }

  function openEdit(item: NamedReference | Performer) {
    setEditingItem(item);
    setModalError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingItem(null);
    setModalError(null);
  }

  function handleSubmit(values: Record<string, string>) {
    setModalError(null);
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, values });
    } else {
      createMutation.mutate(values);
    }
  }

  function confirmDelete() {
    if (deletingId !== null) deleteMutation.mutate(deletingId);
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      <RoutingHeader user={user} roleLabel={roleLabel} onLogout={logout} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toolbar */}
        <section className="bg-white rounded-3xl shadow-lg/5 border border-gray-200 p-3 mb-3">
          <div className="flex items-center justify-between">
            <p className="pl-3 text-base font-bold">
              Управление справочниками
            </p>
            <Button type="button" size="small" color="primary" onClick={openCreate} icon={<Plus />}>
              Добавить
            </Button>
          </div>
        </section>

        {/* Tabs */}
        <section className="bg-white rounded-3xl shadow-lg/5 border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`flex-1 px-4 py-3 text-sm font-medium transition cursor-pointer ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary bg-primary/4'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {REFERENCE_TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          {/* Table */}
          {namedQuery.isLoading ? (
            <div className="p-6 flex justify-center">
              <Spinner />
            </div>
          ) : !items.length ? (
            <div className="p-6 text-center text-sm text-gray-500">Записи не найдены</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  {columns.map((col) => (
                    <th key={col.key} className="px-6 py-3 font-semibold text-gray-600">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 font-semibold text-gray-600 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 text-gray-900">
                        {cellValue(activeTab, item, col.key)}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-primary/8 hover:text-primary transition cursor-pointer"
                          onClick={() => openEdit(item)}
                          title="Редактировать"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-red-50 hover:text-error transition cursor-pointer"
                          onClick={() => setDeletingId(item.id)}
                          title="Удалить"
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

      {/* Create / Edit modal */}
      <ReferenceModal
        isOpen={isModalOpen}
        title={editingItem ? 'Редактировать запись' : 'Новая запись'}
        fields={fields}
        initialValues={editingItem ? itemToValues(activeTab, editingItem) : undefined}
        isSubmitting={isSubmitting}
        error={modalError}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation */}
      {deletingId !== null && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/40"
          onClick={() => setDeletingId(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-xl/5 w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Удаление записи</h2>
            <p className="text-sm text-gray-600 mb-6">
              Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить.
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
