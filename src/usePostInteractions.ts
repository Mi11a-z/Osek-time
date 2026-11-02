"use client";

import { useState } from "react";

// Пока данные живут только в открытой карточке, как и до разделения компонентов.
export function usePostInteractions(initialLikes: number, initialComments: string[] = []) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState(initialComments);

  function toggleLike() {
    setIsLiked((previous) => !previous);
  }

  function toggleSave() {
    setIsSaved((previous) => !previous);
  }

  function addComment(text: string) {
    const comment = text.trim();
    if (comment) setComments((previous) => [...previous, comment]);
  }

  function deleteComment(index: number) {
    setComments((previous) => previous.filter((_, currentIndex) => currentIndex !== index));
  }

  return {
    likes: initialLikes + (isLiked ? 1 : 0),
    isLiked,
    isSaved,
    comments,
    toggleLike,
    toggleSave,
    addComment,
    deleteComment,
  };
}
