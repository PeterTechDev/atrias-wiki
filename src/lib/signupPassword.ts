export function signupPasswordError(password: string, confirmation: string) {
  return password === confirmation ? '' : 'As senhas não coincidem.'
}
