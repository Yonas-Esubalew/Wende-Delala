export function friendlyErrorMessage(error, t, fallbackKey = 'requestFailed', context = 'default') {
  const status = error?.response?.status
  const serverMessage = String(error?.response?.data?.error?.message || '').toLowerCase()
  const code = String(error?.code || '').toLowerCase()

  if (serverMessage.includes('invalid email or password')) return t('authInvalidCredentials')
  if (serverMessage.includes('already registered') || serverMessage.includes('already exists')) return t('emailAlreadyRegistered')
  if (serverMessage.includes('at least one image')) return t('imagesRequired')
  if (code.includes('timeout') || serverMessage.includes('timed out')) return t('requestTimeout')
  if (status === 401) return t(context === 'auth' ? 'authInvalidCredentials' : 'sessionExpired')
  if (status === 403) return t('accessDenied')
  if (status === 404) return t('contentNotFound')
  if (status === 409) return t('requestConflict')
  if (status === 413) return t('uploadTooLarge')
  if (status === 429) return t('tooManyRequests')
  if (status === 400 || status === 422) return t('checkFormError')
  if (status >= 500) return t('serviceUnavailable')
  if (!error?.response && (error?.request || code === 'err_network')) return t('connectionProblem')
  return t(fallbackKey)
}
