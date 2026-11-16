import type { Metadata } from "next";
import { FeedPage } from "../page";

export const metadata: Metadata = {
  title: "Популярное — Osek Time",
};

export default function PopularPage() {
  return <FeedPage section="popular" />;
}
