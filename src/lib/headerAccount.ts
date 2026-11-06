export const HEADER_ACCOUNT_TIMEOUT_MS = 8000
export const headerAccountTimeoutMessage = 'Não foi possível confirmar a sessão.'

export function visibleAccount<T extends { is_anonymous?: boolean }>(user: T | null | undefined) {
  return user && !user.is_anonymous ? user : null
}
