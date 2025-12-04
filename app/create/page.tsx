'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { assignSecretFriends } from '@/lib/secretSanta'

export default function CreateEvent() {
  const router = useRouter()
  const [eventName, setEventName] = useState('')
  const [organizerName, setOrganizerName] = useState('')
  const [password, setPassword] = useState('')
  const [participants, setParticipants] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addParticipant = () => {
    setParticipants([...participants, ''])
  }

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index))
  }

  const updateParticipant = (index: number, value: string) => {
    const newParticipants = [...participants]
    newParticipants[index] = value
    setParticipants(newParticipants)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validar campos
      if (!eventName.trim() || !organizerName.trim() || !password.trim()) {
        setError('Preencha todos os campos obrigatórios')
        setLoading(false)
        return
      }

      const validParticipants = participants.filter(p => p.trim() !== '')
      if (validParticipants.length < 3) {
        setError('Adicione pelo menos 3 participantes para o sorteio')
        setLoading(false)
        return
      }

      // Criar evento
      const eventId = uuidv4()
      const { error: eventError } = await supabase
        .from('events')
        .insert({
          id: eventId,
          name: eventName,
          password: password,
          organizer_name: organizerName,
        })

      if (eventError) throw eventError

      // Criar participantes com IDs temporários para o sorteio
      const participantIds: string[] = []
      const participantsData = validParticipants.map(name => {
        const participantId = uuidv4()
        participantIds.push(participantId)
        return {
          id: participantId,
          event_id: eventId,
          name: name.trim(),
        }
      })

      // Fazer o sorteio dos amigos secretos
      const secretFriends = assignSecretFriends(participantIds)

      // Atualizar os participantes com seus amigos secretos
      const participantsWithFriends = participantsData.map(participant => ({
        ...participant,
        selected_by: secretFriends.get(participant.id) || null,
        confirmed: false, // Ainda não confirmado pelo usuário
      }))

      const { error: participantsError } = await supabase
        .from('participants')
        .insert(participantsWithFriends)

      if (participantsError) throw participantsError

      // Redirecionar para página de sucesso com link
      router.push(`/event/${eventId}?created=true`)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar evento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-6">Criar Evento</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Nome do Evento *
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ex: Amigo Secreto 2024"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Seu Nome (Organizador) *
            </label>
            <input
              type="text"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Senha do Evento *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Senha para acessar o evento"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Esta senha será necessária para acessar o evento
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Participantes *
            </label>
            <div className="space-y-2">
              {participants.map((participant, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={participant}
                    onChange={(e) => updateParticipant(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={`Participante ${index + 1}`}
                  />
                  {participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addParticipant}
              className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              + Adicionar Participante
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando...' : 'Criar Evento'}
          </button>
        </form>
      </div>
    </div>
  )
}

