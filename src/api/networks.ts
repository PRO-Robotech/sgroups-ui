import axios, { AxiosResponse } from 'axios'
import { TNwResponse, TNetworkForm } from 'localTypes/networks'
import { getBaseEndpoint } from './env'

export const getNetworks = (): Promise<AxiosResponse<TNwResponse>> =>
  axios.post<TNwResponse>(`${getBaseEndpoint()}/v1/list/networks`)

export const getNetworkByName = (name: string): Promise<AxiosResponse<TNwResponse>> =>
  axios.post<TNwResponse>(
    `${getBaseEndpoint()}/v1/list/networks`,
    {
      neteworkNames: [name],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const addNetwork = async (name: string, cidr: string): Promise<AxiosResponse> => {
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      networks: {
        networks: [
          {
            name,
            network: {
              CIDR: cidr,
            },
          },
        ],
      },
      syncOp: 'Upsert',
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export const addNetworks = async (nws: TNetworkForm[]): Promise<AxiosResponse> => {
  const networks = nws.filter(({ name, CIDR }) => name && CIDR && name.length > 0 && CIDR.length > 0)
  const body = networks.map(({ name, CIDR }) => ({
    name,
    network: {
      CIDR,
    },
  }))

  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      networks: {
        networks: body,
      },
      syncOp: 'Upsert',
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export const removeNetwork = async (names: string[]): Promise<AxiosResponse> => {
  const currentNetworks = (await getNetworks()).data.networks
  const deletedNetworks = [...currentNetworks].filter(el => names.includes(el.name))
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      networks: {
        networks: deletedNetworks,
      },
      syncOp: 'Delete',
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export const editNetwork = async (name: string, cidr: string): Promise<AxiosResponse> => {
  const modifiedNetworks = [
    {
      name,
      network: {
        CIDR: cidr,
      },
    },
  ]
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      networks: {
        networks: modifiedNetworks,
      },
      syncOp: 'Upsert',
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}
