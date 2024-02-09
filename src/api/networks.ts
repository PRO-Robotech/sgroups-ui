import axios, { AxiosResponse } from 'axios'
import { TNWResponse } from 'localTypes/networks'
import { getBaseEndpoint } from './env'

export const getNetworks = (): Promise<AxiosResponse<TNWResponse>> =>
  axios.post<TNWResponse>(`${getBaseEndpoint()}/v1/list/networks`)

export const getNetworkByName = (name: string): Promise<AxiosResponse<TNWResponse>> =>
  axios.post<TNWResponse>(
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

export const removeNetwork = async (name: string): Promise<AxiosResponse> => {
  const currentNetworks = (await getNetworks()).data.networks
  const deletedNetworks = [...currentNetworks].filter(el => el.name === name)
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
