"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "osek-post-views";

function readAll(): Record<string, number> {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
        return {};
    }
}

// countView = true только на странице самого поста
export function usePostViews(postId: number, countView = false) {
    const [views, setViews] = useState(0);

    useEffect(() => {
        const all = readAll();
        const sessionKey = `osek-viewed-${postId}`;

        if (countView) {
            try {
                if (!sessionStorage.getItem(sessionKey)) {
                    all[postId] = (all[postId] ?? 0) + 1;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
                    sessionStorage.setItem(sessionKey, "1");
                }
            } catch {
                /* хранилище недоступно — просто не считаем */
            }
        }

        setViews(all[postId] ?? 0);
    }, [postId, countView]);

    return views;
}