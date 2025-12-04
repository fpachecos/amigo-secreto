'use client'

import { Participant } from '@/lib/supabase'

interface ParticipantSelectionProps {
  participants: Participant[]
  onSelect: (participant: Participant) => void
  myParticipantId?: string | null
}

export default function ParticipantSelection({
  participants,
  onSelect,
  myParticipantId,
}: ParticipantSelectionProps) {
  const availableParticipants = participants.filter(p => !p.confirmed)
  const confirmedParticipants = participants.filter(p => p.confirmed)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
      <h2 className="text-2xl font-bold text-purple-600 mb-4">
        Participantes
      </h2>
      
      {/* Participantes disponíveis para seleção */}
      {availableParticipants.length > 0 && (
        <>
          <p className="text-gray-600 mb-4">
            Selecione seu nome na lista abaixo para descobrir seu amigo secreto
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {availableParticipants.map((participant) => (
              <button
                key={participant.id}
                onClick={() => onSelect(participant)}
                className="p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg text-left transition-colors"
              >
                <span className="font-semibold text-gray-800">{participant.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Participantes já confirmados */}
      {confirmedParticipants.length > 0 && (
        <>
          {availableParticipants.length > 0 && (
            <div className="border-t border-gray-200 my-6"></div>
          )}
          <p className="text-gray-600 mb-4">
            {availableParticipants.length === 0 
              ? 'Todos os participantes já foram selecionados'
              : 'Participantes já confirmados (clique para ver/editar)'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {confirmedParticipants.map((participant) => {
              const isMe = participant.id === myParticipantId
              return (
                <button
                  key={participant.id}
                  onClick={() => onSelect(participant)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    isMe
                      ? 'bg-green-50 border-green-300 hover:bg-green-100'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">{participant.name}</span>
                    {isMe && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Você
                      </span>
                    )}
                    {!isMe && (
                      <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded">
                        Confirmado
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {participants.length === 0 && (
        <p className="text-gray-500 text-center py-4">Nenhum participante cadastrado ainda</p>
      )}
    </div>
  )
}

