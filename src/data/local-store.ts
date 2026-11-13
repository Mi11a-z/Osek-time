"use client";

import { useSyncExternalStore } from "react";
import { createLocalStore, EMPTY_LOCAL_SNAPSHOT, LEGACY_STORAGE_KEYS, LOCAL_STORAGE_KEY } from "./local-state";
export type { LocalComment, LocalPost, LocalProfile, LocalSnapshot } from "./local-state";

export const localStore = createLocalStore(() => window.localStorage);
export const getLocalSnapshot = localStore.getSnapshot;
let subscribers = 0;
function onStorage(event: StorageEvent) {
  if (event.key === null || event.key === LOCAL_STORAGE_KEY || LEGACY_STORAGE_KEYS.includes(event.key)) localStore.reload();
}
function subscribe(listener: () => void) {
  const unsubscribe = localStore.subscribe(listener);
  if (subscribers++ === 0) {
    window.addEventListener("storage", onStorage);
    localStore.reload();
  }
  return () => {
    unsubscribe();
    if (--subscribers === 0) window.removeEventListener("storage", onStorage);
  };
}

export function useLocalData() {
  return useSyncExternalStore(subscribe, localStore.getSnapshot, () => EMPTY_LOCAL_SNAPSHOT);
}

export const {
  createLocalPost, toggleLocalLike, toggleLocalSaved, voteLocalPoll, deleteLocalPost, editLocalPost,
  addLocalComment, deleteLocalComment, saveLocalProfile, saveLocalAvatar,
} = localStore;
