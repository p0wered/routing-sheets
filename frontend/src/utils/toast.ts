import { toast as sonnerToast } from 'sonner';

export function extractError(error: unknown, fallback: string): string {
  const axiosError = error as { response?: { data?: string | { message?: string } } };
  if (typeof axiosError.response?.data === 'string') return axiosError.response.data;
  if (typeof axiosError.response?.data === 'object' && axiosError.response.data?.message)
    return axiosError.response.data.message;
  return fallback;
}

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
};
