import { cloneElement, isValidElement } from "react";

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
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}) {
  const temErro = !!erros?.length;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {rotulo}
      </label>
      {isValidElement(children) && temErro
        ? cloneElement(children, { "aria-describedby": `${id}-erro`, "aria-invalid": true })
        : children}
      {temErro && (
        <div id={`${id}-erro`} className="mt-1 text-sm text-red-600">
          {erros.map((m) => (
            <p key={m}>{m}</p>
          ))}
        </div>
      )}
    </div>
  );
}
