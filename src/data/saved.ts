import { useEffect, useState } from "react";

const KEY = "osek-saved-posts";
const EVENT = "osek-saved-change";

export function getSavedIds(): number[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
        return [];
    }
}

export function toggleSaved(id: number): boolean {
    const ids = getSavedIds();
    const isSaved = ids.includes(id);
    const next = isSaved ? ids.filter((x) => x !== id) : [...ids, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
    return !isSaved;
}

export function useSavedIds(): number[] {
    const [ids, setIds] = useState<number[]>([]);

    useEffect(() => {
        const update = () => setIds(getSavedIds());
        update();
        window.addEventListener(EVENT, update);
        window.addEventListener("storage", update);
        return () => {
            window.removeEventListener(EVENT, update);
            window.removeEventListener("storage", update);
        };
    }, []);

    return ids;
}