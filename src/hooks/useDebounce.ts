import {useEffect, useState} from "react";

/**
 * Atrasa a atualização de um valor pelo tempo especificado.
 * Útil para evitar requisições a cada tecla em campos de busca.
 *
 * @example
 * const debouncedSearch = useDebounce(search, 400);
 * useQuery({ queryKey: ["pacientes", debouncedSearch], ... });
 */
export function useDebounce<T>(value: T, delay = 400): T {
    const [debounced, setDebounced] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}