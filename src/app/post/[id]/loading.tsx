import { BackHeader } from "../../../components/ui/BackHeader";

export default function PostLoading() {
  return (
    <main className="mx-auto [max-width:var(--layout-post-max-width)] [padding:var(--layout-post-padding)]" aria-busy="true">
      <BackHeader prefix="pd" />
      <p className="py-[30px] text-center text-muted" role="status">Загрузка публикации…</p>
    </main>
  );
}
