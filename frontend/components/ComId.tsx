import { Suspense } from "react";

async function Resolvido({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: (id: string) => React.ReactNode;
}) {
  const { id } = await params;
  return children(id);
}

export default function ComId({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: (id: string) => React.ReactNode;
}) {
  return (
    <Suspense fallback={<p>Carregando…</p>}>
      <Resolvido params={params}>{children}</Resolvido>
    </Suspense>
  );
}
