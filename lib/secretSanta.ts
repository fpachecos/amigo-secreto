/**
 * Função para sortear amigos secretos garantindo:
 * 1. Todos têm um amigo secreto
 * 2. Ninguém é amigo secreto de si mesmo
 */
export function assignSecretFriends(participantIds: string[]): Map<string, string> {
  const assignments = new Map<string, string>()
  
  if (participantIds.length < 2) {
    throw new Error('É necessário pelo menos 2 participantes para o sorteio')
  }

  // Criar uma cópia embaralhada da lista
  const shuffled = [...participantIds].sort(() => Math.random() - 0.5)
  
  // Atribuir cada pessoa ao próximo na lista (circular)
  for (let i = 0; i < shuffled.length; i++) {
    const current = shuffled[i]
    const next = shuffled[(i + 1) % shuffled.length]
    assignments.set(current, next)
  }

  // Verificar se alguém ficou sem amigo ou se alguém é amigo de si mesmo
  // Se isso acontecer (improvável, mas possível), refazer o sorteio
  let isValid = true
  for (const [participant, friend] of assignments) {
    if (participant === friend || !friend) {
      isValid = false
      break
    }
  }

  // Se não for válido, tentar novamente (recursão limitada)
  if (!isValid && participantIds.length > 2) {
    return assignSecretFriends(participantIds)
  }

  return assignments
}

