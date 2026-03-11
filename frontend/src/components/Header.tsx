import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types/auth';
import { Menu } from 'lucide-react';
import { DropdownList } from './DropdownList';

interface RoutingHeaderProps {
  user: User;
  roleLabel: string;
  onLogout: () => void;
}

export function RoutingHeader({ user, roleLabel, onLogout }: RoutingHeaderProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-white border-b border-gray-200 shadow-lg/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold">
              МЛ
            </div>
            <span className="text-lg font-semibold text-gray-900">
              Маршрутные листы
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.fullName}
              </p>
              <p className="text-xs text-gray-500">{roleLabel}</p>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition cursor-pointer
                ${
                  isMenuOpen
                    ? 'bg-primary text-white border-primary'
                    : 'bg-primary/12 text-primary hover:bg-primary/20'
                }`}
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                <Menu className="w-5 h-5" />
              </button>

              {isMenuOpen && (
                <DropdownList
                  className="right-0 w-44"
                  items={[
                    ...(user.role === 'WorkshopChief' || user.role === 'PlanningDept'
                      ? [
                          {
                            key: 'references',
                            label: 'Справочники',
                            onClick: () => {
                              setIsMenuOpen(false);
                              navigate('/references');
                            },
                          },
                        ]
                      : []),
                    ...(user.role === 'WorkshopChief'
                      ? [
                          {
                            key: 'users',
                            label: 'Пользователи',
                            onClick: () => {
                              setIsMenuOpen(false);
                              navigate('/users');
                            },
                          },
                        ]
                      : []),
                    {
                      key: 'logout',
                      label: 'Выйти',
                      onClick: () => {
                        setIsMenuOpen(false);
                        onLogout();
                      },
                    },
                  ]}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

