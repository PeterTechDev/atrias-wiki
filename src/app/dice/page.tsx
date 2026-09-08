import type { Metadata } from 'next'
import DiceRoller from './DiceRoller'

export const metadata: Metadata = {
  title: 'Mesa de Dados | Átrias Wiki',
  description: 'Prepare seus dados, invoque a sorte e role na mesa de Átrias. Dados 3D, histórico e combinações favoritas para sua sessão de RPG.',
}

export default function DicePage() {
  return <DiceRoller />
}
