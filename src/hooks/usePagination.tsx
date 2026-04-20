import {useState} from "react";

export function usePagination<T>(items: T[], perPage = 10) {
    const [page, setPage] = useState(1);

    const totalPages = Math.ceil(items.length / perPage);
    const start = (page - 1) * perPage;
    const paginated = items.slice(start, start + perPage);

    const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
    const next = () => goTo(page + 1);
    const prev = () => goTo(page - 1);

    return { paginated, page, totalPages, next, prev, goTo };
}