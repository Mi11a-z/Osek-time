import { BackHeader } from "../../../components/ui/BackHeader";
import "./post.css";

export default function PostLoading() {
  return (
    <main className="pd-shell" aria-busy="true">
      <BackHeader prefix="pd" />
      <p className="pd-empty" role="status">Загрузка публикации…</p>
    </main>
  );
}
