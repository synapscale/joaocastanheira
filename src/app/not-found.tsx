import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-extrabold text-primary">404</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Página não encontrada</h2>
          <p className="mt-2 text-sm text-gray-600">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        <div className="mt-8">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}
