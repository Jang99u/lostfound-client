import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// 인증 관련 훅
export const useAuthState = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  return {
    user,
    isAuthenticated,
    isLoading,
  };
};

// 로컬 스토리지 훅
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

// 폼 상태 관리 훅
export const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // 에러가 있으면 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const setError = (name: keyof T, error: string) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    handleChange,
    setError,
    reset,
  };
};

// 디바운스 훅
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
