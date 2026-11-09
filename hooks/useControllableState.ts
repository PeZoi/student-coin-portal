import { useState, useCallback, useRef, useEffect } from "react";

interface UseControllableStateParams<T> {
  prop?: T;
  defaultProp?: T;
  onChange?: (state: T) => void;
}

/**
 * Hook quản lý trạng thái Controlled / Uncontrolled linh hoạt (Chuẩn công nghiệp theo Radix UI).
 *
 * - Khi `prop !== undefined` (Controlled): Giá trị lấy từ `prop`, gọi `setValue` sẽ kích hoạt callback `onChange`.
 * - Khi `prop === undefined` (Uncontrolled): Hoạt động như `useState` thông thường với giá trị khởi tạo `defaultProp`.
 *
 * Loại bỏ hoàn toàn nhu cầu sử dụng useEffect để đồng bộ props vào state, tránh lỗi Cascading Renders.
 */
export function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableStateParams<T>): [T, (next: T | ((prev: T) => T)) => void] {
  const [uncontrolledProp, setUncontrolledProp] = useState<T | undefined>(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : (uncontrolledProp as T);

  // Lưu tham chiếu mới nhất của callback onChange mà không gây re-render
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      if (isControlled) {
        const nextValue =
          typeof next === "function" ? (next as (prev: T) => T)(prop as T) : next;
        if (nextValue !== prop) {
          onChangeRef.current?.(nextValue);
        }
      } else {
        setUncontrolledProp((prev) => {
          const nextValue =
            typeof next === "function" ? (next as (prev: T | undefined) => T)(prev) : next;
          onChangeRef.current?.(nextValue);
          return nextValue;
        });
      }
    },
    [isControlled, prop]
  );

  return [value, setValue];
}
