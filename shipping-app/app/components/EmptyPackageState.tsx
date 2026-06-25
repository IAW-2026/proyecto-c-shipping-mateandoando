// app/components/EmptyPackageState.tsx

interface EmptyPackageStateProps {
  title?: string;
  message?: string;
}

export default function EmptyPackageState({ 
  title = "No se encontraron paquetes", 
  message = "No hay resultados para esta búsqueda o filtro. Intentá con otros datos." 
}: EmptyPackageStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-zinc-300 rounded-2xl w-full my-8 shadow-sm">
      
      {/* Ícono SVG de la Cajita Triste */}
      <div className="bg-zinc-50 p-6 rounded-full mb-4 border border-zinc-100">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="64" 
          height="64" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-zinc-400"
        >
          {/* Estructura de la caja */}
          <rect x="4" y="8" width="16" height="13" rx="1" />
          <path d="M4 8l4-5h8l4 5" />
          <line x1="4" y1="8" x2="20" y2="8" />
          
          {/* Ojitos tristes */}
          <path d="M9 14h.01" strokeWidth="2.5" />
          <path d="M15 14h.01" strokeWidth="2.5" />
          
          {/* Boquita triste (frown) */}
          <path d="M10 17a3 3 0 0 1 4 0" />
        </svg>
      </div>

      {/* Textos descriptivos */}
      <h3 className="text-lg font-bold text-[#1E3F20] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
        {title}
      </h3>
      <p className="text-zinc-500 text-sm max-w-sm">
        {message}
      </p>

    </div>
  );
}