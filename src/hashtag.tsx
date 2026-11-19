import Link from "next/link";

const hashtag = String.raw`#[\p{L}\p{N}_][\p{L}\p{M}\p{N}_]*`;
const tokenPattern = new RegExp(`(${hashtag})`, "gu");
export const fullHashtag = new RegExp(`^${hashtag}$`, "u");

export function containsHashtag(text: string, tag: string) {
  return text.toLowerCase().match(tokenPattern)?.includes(`#${tag.toLowerCase()}`) ?? false;
}

export function renderTextWithHashtags(
  text: string,
  onHashtagClick?: (tag: string) => void,
  postHref?: string,
) {
  return text.split(tokenPattern).map((part, index) => {
    if (!part) return null;
    if (index % 2 === 0) {
      return postHref ? (
        <Link key={index} href={postHref} className="text-inherit no-underline" onClick={(event) => event.stopPropagation()}>
          {part}
        </Link>
      ) : part;
    }
    const tag = part.slice(1).toLowerCase();
    return (
      <Link key={index} href={{ pathname: "/", query: { tag } }}
        onClick={(event) => event.stopPropagation()}
        onNavigate={onHashtagClick && ((event) => {
          event.preventDefault();
          onHashtagClick(tag);
        })}
        className="font-medium text-coral-deep no-underline hover:underline">
        {part}
      </Link>
    );
  });
}
