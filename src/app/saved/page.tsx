import type { Metadata } from "next";
import { FeedPage } from "../page";

export const metadata: Metadata = {
  title: "Сохранённое — Osek Time",
};

export default function SavedPage() {
  return <FeedPage section="saved" />;
}
