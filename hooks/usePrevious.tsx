import { useEffect, useRef } from "react";

export function usePrevious(value: string): string | undefined {
  const ref = useRef<string | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

