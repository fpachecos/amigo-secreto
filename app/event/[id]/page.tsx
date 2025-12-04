'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase, Event, Participant } from '@/lib/supabase'
import ConfirmationModal from '@/components/ConfirmationModal'
import ParticipantSelection from '@/components/ParticipantSelection'
import WishList from '@/components/WishList'

export default function EventPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const eventId = params.id as string
  const isCreated = searchParams.get('created') === 'true'

  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showWishForm, setShowWishForm] = useState(false)
  const [wish, setWish] = useState('')
  const [mySecretFriend, setMySecretFriend] = useState<Participant | null>(null)
  const [myParticipant, setMyParticipant] = useState<Participant | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSecretFriend, setShowSecretFriend] = useState(false)

  useEffect(() => {
    loadEvent()
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
        } else if (eventError.message?.includes('JWT')) {
          setError('Erro de configuração: verifique as credenciais do Supabase no arquivo .env.local')
        } else {
          setError(`Erro ao carregar evento: ${eventError.message}`)
        }
        return
      }
      
      setEvent(eventData)
      
      // Carregar participantes
      await loadParticipants()
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
      
      // Verificar se há um participante já confirmado no localStorage
      if (typeof window !== 'undefined') {
        const savedParticipantId = localStorage.getItem(`event_${eventId}_participant`)
        if (savedParticipantId) {
          const participant = participantsData?.find(p => p.id === savedParticipantId)
          if (participant && participant.confirmed) {
            // Buscar o amigo secreto
            const secretFriend = participantsData?.find(p => p.id === participant.selected_by)
            if (secretFriend) {
              setMyParticipant(participant)
              setMySecretFriend(secretFriend)
              setWish(participant.wish || '')
              setShowSecretFriend(false) // Sempre começar oculto ao carregar
            }
          }
        }
      }
    } catch (err) {
      console.error('Erro ao carregar participantes:', err)
    }
  }

  const handleParticipantSelect = (participant: Participant) => {
    // Verificar se o usuário já tem um participante salvo
    const savedParticipantId = typeof window !== 'undefined' 
      ? localStorage.getItem(`event_${eventId}_participant`)
      : null

    // Se já foi confirmado
    if (participant.confirmed) {
      // Se é o mesmo usuário que já escolheu antes, mostrar amigo secreto diretamente (oculto)
      if (savedParticipantId === participant.id) {
        const secretFriend = participants.find(p => p.id === participant.selected_by)
        if (secretFriend) {
          setMyParticipant(participant)
          setMySecretFriend(secretFriend)
          setWish(participant.wish || '')
          setShowSecretFriend(false) // Sempre começar oculto
          // Scroll para a seção do amigo secreto
          setTimeout(() => {
            const element = document.getElementById('my-secret-friend')
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }, 100)
        }
        return
      } 
      // Se o usuário não tem nenhum participante salvo, mostrar modal de confirmação
      else if (!savedParticipantId) {
        // Usuário novo pode escolher qualquer participante, mesmo confirmado
        // Mas sempre pedir confirmação via modal
        setSelectedParticipant(participant)
        setShowConfirmation(true)
        return
      }
      // Se o usuário já tem outro participante salvo, não permitir trocar para um confirmado
      else {
        alert('Você já escolheu outro participante. Use o botão "Trocar de Participante" para escolher outro.')
        return
      }
    }
    
    // Participante ainda não confirmado - verificar se tem amigo secreto atribuído
    if (!participant.selected_by) {
      alert('Este participante ainda não tem um amigo secreto atribuído. Contate o organizador.')
      return
    }
    
    // Se o usuário já tem outro participante salvo, não permitir escolher outro não confirmado
    if (savedParticipantId && savedParticipantId !== participant.id) {
      alert('Você já escolheu outro participante. Use o botão "Trocar de Participante" para escolher outro.')
      return
    }
    
    // Participante ainda não confirmado mas tem amigo secreto - mostrar confirmação
    setSelectedParticipant(participant)
    setShowConfirmation(true)
  }

  const handleConfirm = async (isMe: boolean) => {
    if (!isMe || !selectedParticipant) {
      setShowConfirmation(false)
      setSelectedParticipant(null)
      return
    }

    // Verificar se o participante tem um amigo secreto atribuído (deve ter, pois foi sorteado na criação)
    if (!selectedParticipant.selected_by) {
      alert('Erro: Este participante não tem um amigo secreto atribuído. Contate o organizador.')
      setShowConfirmation(false)
      setSelectedParticipant(null)
      return
    }

    // Buscar o amigo secreto já atribuído
    const secretFriend = participants.find(p => p.id === selectedParticipant.selected_by)
    if (!secretFriend) {
      alert('Erro: Amigo secreto não encontrado. Contate o organizador.')
      setShowConfirmation(false)
      setSelectedParticipant(null)
      return
    }

    // Verificar se já foi confirmado no banco
    const existing = participants.find(p => p.id === selectedParticipant.id && p.confirmed)
    
    // Se ainda não foi confirmado no banco, marcar como confirmado
    if (!existing) {
      await updateParticipant(selectedParticipant.id)
    }
    
    // Sempre mostrar o amigo secreto e salvar no localStorage
    setMySecretFriend(secretFriend)
    setMyParticipant(selectedParticipant)
    setShowSecretFriend(false) // Começar oculto por padrão
    
    // Salvar no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`event_${eventId}_participant`, selectedParticipant.id)
    }

    setShowConfirmation(false)
    
    // Se o participante já tinha desejo cadastrado, não mostrar o formulário
    // Caso contrário, mostrar para adicionar desejo
    if (!selectedParticipant.wish) {
      setShowWishForm(true)
    } else {
      setWish(selectedParticipant.wish)
    }
  }

  const updateParticipant = async (participantId: string) => {
    const { error } = await supabase
      .from('participants')
      .update({
        confirmed: true,
      })
      .eq('id', participantId)

    if (error) throw error
    await loadParticipants()
  }

  const handleWishSubmit = async () => {
    if (!myParticipant) return

    const wishText = wish.trim()
    const { error } = await supabase
      .from('participants')
      .update({ wish: wishText })
      .eq('id', myParticipant.id)

    if (error) {
      alert('Erro ao salvar desejo')
      return
    }

    setShowWishForm(false)
    await loadParticipants()
  }

  const handleEditWish = () => {
    if (myParticipant) {
      setWish(myParticipant.wish || '')
      setShowWishForm(true)
    }
  }

  const handleChangeParticipant = () => {
    // Limpar dados do participante atual
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`event_${eventId}_participant`)
    }
    setMyParticipant(null)
    setMySecretFriend(null)
    setWish('')
    setShowWishForm(false)
    
    // Scroll para a lista de participantes
    setTimeout(() => {
      const element = document.getElementById('participants-list')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
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
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
            <p className="text-sm text-yellow-800 font-semibold mb-2">Verifique:</p>
            <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
              <li>O arquivo .env.local existe e está configurado?</li>
              <li>As credenciais do Supabase estão corretas?</li>
              <li>O banco de dados foi configurado (executou o supabase-setup.sql)?</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
          >
            Tentar Novamente
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
          <p className="text-gray-700 mb-4">
            O evento com ID {eventId} não foi encontrado.
          </p>
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

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">{event.name}</h1>
          <p className="text-gray-600">Organizado por: {event.organizer_name}</p>
          
          {isCreated && typeof window !== 'undefined' && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <p className="font-semibold mb-2">Evento criado com sucesso! 🎉</p>
              <p className="text-sm mb-2">Compartilhe este link com os participantes:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/event/${eventId}`}
                  className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm"
                />
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(`${window.location.origin}/event/${eventId}`)
                      alert('Link copiado!')
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Copiar
                </button>
              </div>
              <p className="text-sm mt-2">
                <a href={`/event/${eventId}/admin`} className="underline">
                  Acessar como organizador (requer senha)
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Seção do Amigo Secreto (sempre visível se já confirmado) */}
        {mySecretFriend && myParticipant && (
          <div id="my-secret-friend" className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-purple-600">
                🎁 Seu Amigo Secreto
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSecretFriend(!showSecretFriend)}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
                  title={showSecretFriend ? "Ocultar amigo secreto" : "Mostrar amigo secreto"}
                >
                  {showSecretFriend ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ocultar
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                      Mostrar
                    </>
                  )}
                </button>
                <button
                  onClick={handleChangeParticipant}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                  title="Trocar de participante (permitir outra pessoa usar este navegador)"
                >
                  Trocar de Participante
                </button>
              </div>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg mb-4">
              {showSecretFriend ? (
                <>
                  <p className="text-xl font-semibold text-gray-800 mb-2">
                    {mySecretFriend.name}
                  </p>
                  {mySecretFriend.wish && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-1">Desejo:</p>
                      <p className="text-gray-800">{mySecretFriend.wish}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-lg mb-2">🔒</p>
                  <p className="text-gray-600">Clique em "Mostrar" para ver seu amigo secreto</p>
                </div>
              )}
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Você é:</strong> {myParticipant.name}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-700">
                  <strong>Seu desejo:</strong> {myParticipant.wish || 'Nenhum desejo cadastrado'}
                </p>
                <button
                  onClick={handleEditWish}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                >
                  {myParticipant.wish ? 'Editar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Participantes (sempre visível) */}
        <div id="participants-list">
          <ParticipantSelection
            participants={participants}
            onSelect={handleParticipantSelect}
            myParticipantId={myParticipant?.id}
          />
        </div>

        {/* Lista de Desejos */}
        <WishList participants={participants} />

        <ConfirmationModal
          isOpen={showConfirmation}
          participantName={selectedParticipant?.name || ''}
          onConfirm={handleConfirm}
          onClose={() => {
            setShowConfirmation(false)
            setSelectedParticipant(null)
          }}
        />

        {/* Modal de Desejo */}
        {showWishForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-purple-600 mb-4">
                O que você quer ganhar?
              </h2>
              <textarea
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                rows={4}
                placeholder="Descreva o que você gostaria de ganhar..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleWishSubmit}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setShowWishForm(false)
                    if (myParticipant) {
                      setWish(myParticipant.wish || '')
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
