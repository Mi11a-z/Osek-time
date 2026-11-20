import { BackHeader } from "../../../../../components/ui/BackHeader";

export default function AccountReportsLoading() {
  return (
    <main className="mx-auto [max-width:var(--layout-profile-max-width)] [padding:var(--layout-profile-padding)]" aria-busy="true">
      <BackHeader prefix="pf" />
      <p className="py-12 text-center text-muted" role="status">Загружаем жалобы на аккаунт…</p>
    </main>
  );
}
