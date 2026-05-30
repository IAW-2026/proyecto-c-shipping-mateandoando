import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans p-6">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-9xl font-bold text-zinc-200 dark:text-zinc-800">404</h1>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Página no encontrada</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Parece que la ruta que estás buscando no existe, fue movida o no tenés los permisos necesarios para verla.
          </p>
        </div>

        <div className="pt-4">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}