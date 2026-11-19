import Link from "next/link";

export function CityLink({ city }: { city: string }) {
  return (
    <Link href={{ pathname: "/", query: { city } }} onClick={(event) => event.stopPropagation()}
      aria-label={`Показать посты из города ${city}`}
      className="text-inherit underline decoration-transparent underline-offset-2 hover:decoration-current">
      {city}
    </Link>
  );
}
