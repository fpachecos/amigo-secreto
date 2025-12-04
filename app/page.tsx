import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-purple-600 mb-2">🎁</h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Amigo Secreto</h2>
        <p className="text-gray-600 mb-8">
          Organize seu amigo secreto de forma fácil e sem necessidade de dados de contato
        </p>
        <div className="space-y-4">
          <Link
            href="/create"
            className="block w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Criar Evento
          </Link>
          <Link
            href="/access"
            className="block w-full bg-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
          >
            Acessar Evento
          </Link>
        </div>
      </div>
    </div>
  )
}

