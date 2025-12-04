'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AccessEvent() {
  const router = useRouter()
  const [eventId, setEventId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Verificar se o evento existe
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id')
        .eq('id', eventId)
        .single()

      if (eventError || !event) {
        setError('Evento não encontrado')
        setLoading(false)
        return
      }

      // Redirecionar para a página de admin do evento (que pedirá a senha)
      router.push(`/event/${eventId}/admin`)
    } catch (err: any) {
      setError(err.message || 'Erro ao acessar evento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-6 text-center">
          Acessar Evento
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              ID do Evento ou Link
            </label>
            <input
              type="text"
              value={eventId}
              onChange={(e) => {
                // Extrair ID do link se for um link completo
                const value = e.target.value
                const match = value.match(/\/event\/([a-f0-9-]+)/)
                setEventId(match ? match[1] : value)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Cole o link do evento ou o ID"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Cole o link compartilhado pelo organizador
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Acessando...' : 'Acessar'}
          </button>
        </form>
      </div>
    </div>
  )
}

