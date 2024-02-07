export type TRequestErrorData = {
  code: number
  message: string
}

export type TRequestError = {
  status: number | string
  data?: TRequestErrorData
}
