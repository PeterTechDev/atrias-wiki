export const unsavedChangesMessage = 'Você tem alterações não salvas. Deseja sair da página e descartá-las?'

export function shouldConfirmNavigation(current: string, destination: string) {
  const from = new URL(current)
  const to = new URL(destination, current)
  return from.origin !== to.origin || from.pathname !== to.pathname || from.search !== to.search
}

export function confirmDiscard(dirty: boolean, confirm: (message: string) => boolean) {
  return !dirty || confirm(unsavedChangesMessage)
}
