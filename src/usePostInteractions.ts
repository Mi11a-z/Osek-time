"use client";

import { useLocalData, toggleLocalLike, toggleLocalSaved, addLocalComment, deleteLocalComment } from "./data/local-store";

export function usePostInteractions(postId: number) {
  const snapshot = useLocalData();
  const post = snapshot.posts.find((entry) => entry.id === postId);
  const comments = post?.comments ?? [];
  return {
    likes: post?.likes ?? 0, isLiked: post?.liked ?? false, isSaved: post?.saved ?? false,
    comments, error: snapshot.error,
    toggleLike: () => toggleLocalLike(postId), toggleSave: () => toggleLocalSaved(postId),
    addComment: (text: string, isAnonymous: boolean) => addLocalComment(postId, text, isAnonymous), deleteComment: (index: number) => deleteLocalComment(postId, index, comments),
  };
}
