'use client'

import { Participant } from '@/lib/supabase'

interface WishListProps {
  participants: Participant[]
}

export default function WishList({ participants }: WishListProps) {
  const participantsWithWishes = participants.filter(p => p.wish)

  if (participantsWithWishes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">
          Lista de Desejos
        </h2>
        <p className="text-gray-600">
          Nenhum desejo cadastrado ainda.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-purple-600 mb-4">
        Lista de Desejos 🎁
      </h2>
      <p className="text-gray-600 mb-6">
        Veja o que cada participante gostaria de ganhar
      </p>
      <div className="space-y-4">
        {participantsWithWishes.map((participant) => (
          <div
            key={participant.id}
            className="p-4 bg-pink-50 border-l-4 border-pink-400 rounded"
          >
            <h3 className="font-semibold text-gray-800 mb-2">
              {participant.name}
            </h3>
            <p className="text-gray-700">{participant.wish}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

