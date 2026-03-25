import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { User } from '../types/auth';
import { Menu } from 'lucide-react';
import { DropdownList } from './DropdownList';
import { LanguageToggle } from './LanguageToggle';

interface RoutingHeaderProps {
  user: User;
  roleLabel: string;
  onLogout: () => void;
}

export function RoutingHeader({ user, roleLabel, onLogout }: RoutingHeaderProps) {
  const { t } = useTranslation();
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
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold">
              {t('nav.badgeShort')}
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {t('nav.appName')}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right">
              <p className="text-base font-medium text-gray-900">
                {user.fullName}
              </p>
              <p className="text-sm text-gray-500">{roleLabel}</p>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className={`inline-flex items-center justify-center w-11 h-11 rounded-xl transition cursor-pointer
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
                  className="right-0 w-52"
                  header={
                    <div className="flex items-center justify-between gap-2">
                      <LanguageToggle />
                    </div>
                  }
                  items={[
                    {
                      key: 'home',
                      label: t('nav.routingSheets'),
                      onClick: () => {
                        setIsMenuOpen(false);
                        navigate('/');
                      },
                    },
                    {
                      key: 'operations',
                      label: t('nav.operationsByGuild'),
                      onClick: () => {
                        setIsMenuOpen(false);
                        navigate('/operations');
                      },
                    },
                    ...(user.role === 'WorkshopChief' || user.role === 'PlanningDept'
                      ? [
                          {
                            key: 'references',
                            label: t('nav.references'),
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
                            label: t('nav.users'),
                            onClick: () => {
                              setIsMenuOpen(false);
                              navigate('/users');
                            },
                          },
                        ]
                      : []),
                    {
                      key: 'logout',
                      label: t('nav.logout'),
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
