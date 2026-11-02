import type { CSSProperties } from "react";
import design from "./design.json";

// Например, fonts.body превращается в CSS-переменную --fonts-body.
// Значения применяются в layout.tsx и доступны стилям всех компонентов.
function kebabCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export const designVariables = Object.fromEntries(
  Object.entries(design).flatMap(([group, settings]) =>
    Object.entries(settings).map(([name, value]) => [
      `--${kebabCase(group)}-${kebabCase(name)}`,
      value,
    ]),
  ),
) as CSSProperties;
