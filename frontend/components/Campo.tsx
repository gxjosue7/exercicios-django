/** Rótulo + controle + erros da API do campo. O controle deve ter `id` igual ao informado. */
export default function Campo({
  id,
  rotulo,
  erros,
  className,
  children,
}: {
  id: string;
  rotulo: string;
  erros?: string[];
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {rotulo}
      </label>
      {children}
      {erros?.map((m) => (
        <p key={m} id={`${id}-erro`} className="mt-1 text-sm text-red-600">
          {m}
        </p>
      ))}
    </div>
  );
}
