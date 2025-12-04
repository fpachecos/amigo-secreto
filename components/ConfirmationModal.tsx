'use client'

interface ConfirmationModalProps {
  isOpen: boolean
  participantName: string
  onConfirm: (isMe: boolean) => void
  onClose: () => void
}

export default function ConfirmationModal({
  isOpen,
  participantName,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">
          Confirmação
        </h2>
        <p className="text-gray-700 mb-6">
          Você selecionou: <strong>{participantName}</strong>
        </p>
        <p className="text-gray-600 mb-6">
          Confirme se você é esta pessoa:
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(true)}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Sou eu
          </button>
          <button
            onClick={() => onConfirm(false)}
            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Me confundi, não sou eu
          </button>
        </div>
      </div>
    </div>
  )
}

