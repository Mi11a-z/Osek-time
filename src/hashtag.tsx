import React from "react";
export function renderTextWithHashtags(text: string, onHashtagClick?: (tag: string) => void) {
  const parts = text.split(/(#[а-яА-ЯёЁa-zA-Z0-9_]+)/g);

  return parts.map((part, index) => {
    if (part.startsWith("#")) {
      const cleanTag = part.slice(1).toLowerCase();
      return (
        <button
          key={index}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onHashtagClick?.(cleanTag);
          }}
          className="text-[#e85d44] font-medium hover:underline cursor-pointer bg-transparent border-none p-0 inline"
        >
          {part}
        </button>
      );
    }
    return part;
  });
}