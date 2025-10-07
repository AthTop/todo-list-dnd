import { useEffect, useState } from "react";

export default function useLocalStorage<T>(
  keyName: string,
  defaultValue: T
): [state: T, setState: React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const storedData = localStorage.getItem(keyName);
    return storedData ? JSON.parse(storedData) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(keyName, JSON.stringify(state));
  }, [keyName, state]);

  return [state, setState];
}
