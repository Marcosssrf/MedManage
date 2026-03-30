import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
    page: number;
    totalPages: number;
    onNext: () => void;
    onPrev: () => void;
    onGoTo: (p: number) => void;
    total: number;
    perPage: number;
}

export default function Pagination({ page, totalPages, onNext, onPrev, onGoTo, total, perPage }: Props) {
    if (totalPages <= 1) return null;

    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
                Mostrando {start}–{end} de {total}
            </p>
            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="w-8 h-8" onClick={onPrev} disabled={page === 1}>
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                {pages.map((p, i) => {
                    const prev = pages[i - 1];
                    return (
                        <span key={p} className="flex items-center gap-1">
                            {prev && p - prev > 1 && (
                                <span className="text-muted-foreground text-xs px-1">...</span>
                            )}
                            <Button
                                variant={p === page ? "default" : "outline"}
                                size="icon"
                                className="w-8 h-8 text-xs"
                                onClick={() => onGoTo(p)}
                            >
                                {p}
                            </Button>
                        </span>
                    );
                })}
                <Button variant="outline" size="icon" className="w-8 h-8" onClick={onNext} disabled={page === totalPages}>
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}