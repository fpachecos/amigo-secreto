'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Event, Participant } from '@/lib/supabase'
import WishList from '@/components/WishList'

export default function AdminPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar se já está autenticado
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem(`event_${eventId}_admin_auth`)
      if (savedAuth === 'true') {
        setAuthenticated(true)
        loadEvent()
      } else {
        loadEvent()
      }
    }
  }, [eventId])

  const loadEvent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Carregar evento
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (eventError) {
        console.error('Erro do Supabase:', eventError)
        if (eventError.code === 'PGRST116') {
          setError('Evento não encontrado')
        } else {
          setError(`Erro ao carregar evento: ${eventError.message}`)
        }
        return
      }
      
      setEvent(eventData)
      
      // Carregar participantes apenas se autenticado
      if (authenticated) {
        await loadParticipants()
      }
    } catch (err: any) {
      console.error('Erro ao carregar evento:', err)
      setError(err.message || 'Erro desconhecido ao carregar evento')
    } finally {
      setLoading(false)
    }
  }

  const loadParticipants = async () => {
    try {
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('event_id', eventId)
        .order('name')

      if (participantsError) throw participantsError
      setParticipants(participantsData || [])
    } catch (err) {
      console.error('Erro ao carregar participantes:', err)
    }
  }

  useEffect(() => {
    if (authenticated && event) {
      loadParticipants()
    }
  }, [authenticated, event?.id])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    if (password === event.password) {
      setAuthenticated(true)
      setPasswordError('')
      if (typeof window !== 'undefined') {
        localStorage.setItem(`event_${eventId}_admin_auth`, 'true')
      }
      await loadParticipants()
    } else {
      setPasswordError('Senha incorreta')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-xl mb-2">Carregando...</div>
          <div className="text-sm text-gray-500">Aguarde um momento</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push(`/event/${eventId}`)}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
          >
            Voltar ao Evento
          </button>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Evento não encontrado</h2>
          <a
            href="/"
            className="inline-block bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
          >
            Voltar ao Início
          </a>
        </div>
      </div>
    )
  }

  // Tela de autenticação
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2 text-center">
            Acesso do Organizador
          </h1>
          <p className="text-gray-600 mb-2 text-center">
            {event.name}
          </p>
          <p className="text-gray-500 text-sm mb-6 text-center">
            Digite a senha para acessar como organizador
          </p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Senha do evento"
                required
                autoFocus
              />
            </div>
            {passwordError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {passwordError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Acessar
            </button>
            <button
              type="button"
              onClick={() => router.push(`/event/${eventId}`)}
              className="w-full bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Voltar ao Evento
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Tela de administração (apenas visualização)
  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-purple-600 mb-2">{event.name}</h1>
              <p className="text-gray-600">Organizado por: {event.organizer_name}</p>
            </div>
            <div className="bg-purple-100 px-3 py-1 rounded-full">
              <span className="text-purple-700 text-sm font-semibold">👑 Organizador</span>
            </div>
          </div>
          <button
            onClick={() => router.push(`/event/${eventId}`)}
            className="text-purple-600 hover:text-purple-700 text-sm underline"
          >
            ← Ver como participante
          </button>
        </div>

        {/* Lista de Participantes (apenas visualização) */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold text-purple-600 mb-4">
            Participantes ({participants.length})
          </h2>
          <div className="space-y-3">
            {participants.map((participant) => {
              const secretFriend = participants.find(p => p.id === participant.selected_by)
              const isConfirmed = participant.confirmed
              
              return (
                <div
                  key={participant.id}
                  className={`p-4 border-2 rounded-lg ${
                    isConfirmed
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-800">{participant.name}</span>
                        {isConfirmed ? (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                            ✓ Confirmado
                          </span>
                        ) : (
                          <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded">
                            Pendente
                          </span>
                        )}
                      </div>
                      {isConfirmed && secretFriend && (
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Amigo Secreto:</span> {secretFriend.name}
                        </p>
                      )}
                      {participant.wish && (
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-medium">Desejo:</span> {participant.wish}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Lista de Desejos */}
        <WishList participants={participants} />

        {/* Estatísticas */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-purple-600 mb-4">Estatísticas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{participants.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {participants.filter(p => p.confirmed).length}
              </div>
              <div className="text-sm text-gray-600">Confirmados</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">
                {participants.filter(p => !p.confirmed).length}
              </div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="text-3xl font-bold text-pink-600">
                {participants.filter(p => p.wish).length}
              </div>
              <div className="text-sm text-gray-600">Com Desejos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

