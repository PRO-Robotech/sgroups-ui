export const isDev = (): boolean => process.env.NODE_ENV === 'development'

// eslint-disable-next-line no-underscore-dangle
const prodUrl = window._env_.HBF_API || ''

export const getBaseEndpoint = (): string => (isDev() ? 'http://localhost:8000' : prodUrl)
