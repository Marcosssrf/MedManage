import { useRef, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { authService } from "../services/auth";

// ─── TextAreaField ─────────────────────────────
interface TAProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
}
export function TextAreaField({ label, value, onChange }: TAProps) {
    return (
        <div>
            <Label className="text-muted-foreground text-xs">{label}</Label>
            <textarea
                className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background resize-y min-h-[72px] focus:outline-none focus:ring-2 focus:ring-ring"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

// ─── CidAutocomplete ───────────────────────────
export function CidAutocomplete({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [query, setQuery] = useState(value);
    const [debouncedQuery, setDebouncedQuery] = useState(value);
    const [open, setOpen] = useState(false);
    const [results, setResults] = useState<{ codigo: string; descricao: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const allCidsCache = useRef<{ codigo: string; descricao: string }[] | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(t);
    }, [query]);

    useEffect(() => {
        if (debouncedQuery.length < 2) { setResults([]); return; }
        let cancelled = false;
        setLoading(true);
        (async () => {
            const base = import.meta.env.VITE_API_URL || "http://localhost:8080";
            const token = authService.getToken();
            const headers = {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };
            try {
                if (!allCidsCache.current) {
                    const res = await fetch(`${base}/cids`, { headers });
                    if (res.ok) allCidsCache.current = await res.json();
                }
                if (allCidsCache.current && !cancelled) {
                    const q = debouncedQuery.toLowerCase();
                    setResults(allCidsCache.current.filter((c) =>
                        c.codigo?.toLowerCase().includes(q) || c.descricao?.toLowerCase().includes(q)
                    ).slice(0, 10));
                }
            } catch { /* silencia */ }
            if (!cancelled) setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [debouncedQuery]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node))
                setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <Label className="text-muted-foreground text-xs">Código CID</Label>
            <div className="relative mt-1">
                <Input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
                    onFocus={() => query.length >= 2 && setOpen(true)}
                    placeholder="Digite o código (Ex: I20) ou descrição (Ex: Angina)"
                    className="pr-8"
                />
                {query && (
                    <button type="button"
                        onClick={() => { setQuery(""); onChange(""); setResults([]); }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
            {open && (loading || results.length > 0) && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                    {loading && results.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-muted-foreground animate-pulse">Buscando...</div>
                    ) : (
                        results.map((c) => (
                            <button key={c.codigo} type="button"
                                className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                                onMouseDown={() => { setQuery(`${c.codigo} — ${c.descricao}`); onChange(c.codigo); setOpen(false); }}
                            >
                                <span className="font-mono font-semibold text-primary">{c.codigo}</span>
                                <span className="text-muted-foreground ml-2 text-xs">{c.descricao}</span>
                            </button>
                        ))
                    )}
                </div>
            )}
            {open && !loading && debouncedQuery.length >= 2 && results.length === 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg px-3 py-3 text-sm text-muted-foreground">
                    Nenhum CID encontrado para "{debouncedQuery}".
                </div>
            )}
        </div>
    );
}

// ─── MedicoFiltro ──────────────────────────────
export function MedicoFiltro({
    medicos,
    onSelect,
}: {
    medicos: { id: string; nome: string }[];
    onSelect: (id: string | null, nome: string) => void;
}) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [selecionado, setSelecionado] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node))
                setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtrados = query.length === 0
        ? medicos
        : medicos.filter(m => m.nome.toLowerCase().includes(query.toLowerCase()));

    return (
        <div ref={containerRef} className="relative">
            <div className="flex items-center gap-1.5">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Filtrar por médico..."
                        className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground w-52 focus:outline-none focus:ring-2 focus:ring-ring"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelecionado(false);
                            setOpen(true);
                            if (!e.target.value) onSelect(null, "");
                        }}
                        onFocus={() => setOpen(true)}
                    />
                    {open && filtrados.length > 0 && (
                        <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                            {filtrados.map(m => (
                                <button key={m.id}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                                    onMouseDown={(e) => { e.preventDefault(); setQuery(m.nome); setSelecionado(true); setOpen(false); onSelect(m.id, m.nome); }}
                                >
                                    {m.nome}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => { setQuery(""); setSelecionado(false); setOpen(false); onSelect(null, ""); }}
                    className={`text-muted-foreground hover:text-foreground transition-colors ${selecionado ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
