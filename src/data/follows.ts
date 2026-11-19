"use client";

import { useSyncExternalStore } from "react";

export type FollowGraph = Record<string, string[]>;

const STORAGE_KEY = "osek-follow-graph-v1";
let graph: FollowGraph = {};
let loaded = false;
const listeners = new Set<() => void>();

function loadGraph() {
  if (typeof window === "undefined") return graph;

  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    graph = parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string[]] => Array.isArray(entry[1]) && entry[1].every((value) => typeof value === "string")))
      : {};
  } catch {
    graph = {};
  }

  loaded = true;
  return graph;
}

function getSnapshot() {
  return loaded ? graph : typeof window === "undefined" ? graph : loadGraph();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      loadGraph();
      listeners.forEach((notify) => notify());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setFollowing(source: string, target: string, follow: boolean) {
  const from = source.toLowerCase();
  const to = target.toLowerCase();
  if (!from || !to || from === to) return;

  const next = new Set(getSnapshot()[from] ?? []);
  if (follow) next.add(to);
  else next.delete(to);
  graph = { ...graph, [from]: [...next] };
  loaded = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(graph));
  } catch { /* Keep current-tab state if storage is unavailable. */ }
  listeners.forEach((listener) => listener());
}

export function useFollowGraph() {
  return useSyncExternalStore<FollowGraph>(subscribe, getSnapshot, () => ({}));
}

export function followersOf(value: FollowGraph, username: string) {
  const target = username.toLowerCase();
  return Object.entries(value).filter(([, following]) => following.includes(target)).map(([follower]) => follower);
}
