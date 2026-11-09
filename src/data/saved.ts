"use client";
import { localStore, toggleLocalSaved, useLocalData } from "./local-store";

export function getSavedIds(): number[] {
    if (typeof window === "undefined") return [];
    return localStore.getSnapshot().posts.filter((post) => post.saved).map((post) => post.id);
}

export function toggleSaved(id: number): boolean {
    return toggleLocalSaved(id);
}

export function useSavedIds(): number[] {
    return useLocalData().posts.filter((post) => post.saved).map((post) => post.id);
}
