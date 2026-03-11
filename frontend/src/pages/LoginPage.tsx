import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    form?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Укажите логин';
    }

    if (!password.trim()) {
      newErrors.password = 'Укажите пароль';
    }

    if (newErrors.username || newErrors.password) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setErrors({
        form:
          axiosError.response?.data?.message ||
          'Ошибка при входе в систему',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex justify-center items-center gap-3 text-center mb-5 mt-2">
            <LogIn
              className="text-primary"
              strokeWidth={3}
            />
            <h1 className="text-2xl font-bold text-gray-900">
              Авторизация
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <TextInput
              id="username"
              label="Логин"
              type="text"
              inputSize="default"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите логин"
              error={errors.username}
            />

            <TextInput
              id="password"
              label="Пароль"
              type="password"
              inputSize="default"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              error={errors.password}
            />

            {errors.form && (
              <div className="bg-red-50 border border-red-200 text-error text-base mb-2 rounded-xl px-4 py-2">
                {errors.form}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              size="default"
              color="primary"
              className="w-full mt-2 cursor-pointer"
            >
              {isSubmitting ? 'Вход...' : 'Войти'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Routing Sheets &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
