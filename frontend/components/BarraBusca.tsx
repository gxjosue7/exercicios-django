/** Campo de busca + filtros extras (children) + botão. */
export default function BarraBusca({
  busca,
  setBusca,
  aoBuscar,
  placeholder,
  children,
}: {
  busca: string;
  setBusca: (v: string) => void;
  aoBuscar: () => void;
  placeholder: string;
  children?: React.ReactNode;
}) {
  return (
    <form
      className="card mb-4 flex flex-wrap items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        aoBuscar();
      }}
      role="search"
    >
      <div className="min-w-48 flex-1">
        <label htmlFor="busca" className="sr-only">
          {placeholder}
        </label>
        <input
          id="busca"
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={placeholder}
          className="input"
        />
      </div>
      {children}
      <button type="submit" className="btn">
        Buscar
      </button>
    </form>
  );
}

export function Seletor({
  id,
  rotulo,
  valor,
  aoMudar,
  opcoes,
}: {
  id: string;
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  opcoes: [string, string][];
}) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {rotulo}
      </label>
      <select id={id} value={valor} onChange={(e) => aoMudar(e.target.value)} className="input">
        {opcoes.map(([v, r]) => (
          <option key={v} value={v}>
            {r}
          </option>
        ))}
      </select>
    </div>
  );
}
