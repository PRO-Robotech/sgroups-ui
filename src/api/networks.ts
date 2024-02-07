import axios, { AxiosResponse } from 'axios'
import { TNWResponse } from 'localTypes/networks'
import { getBaseEndpoint } from './env'

export const getNetworks = (): Promise<AxiosResponse<TNWResponse>> =>
  axios.post<TNWResponse>(`${getBaseEndpoint()}/v1/list/networks`)

export const getNetworkByName = (name: string): Promise<AxiosResponse<TNWResponse>> =>
  axios.post<TNWResponse>(
    `${getBaseEndpoint()}/v1/list/networks`,
    {
      networkNames: [name],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const addNetwork = async (name: string, cidr: string): Promise<AxiosResponse> => {
  const currentNetworks = (await getNetworks()).data.networks
  const newNetworks = [
    ...currentNetworks,
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
        networks: newNetworks,
      },
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
  const newNetworks = [...currentNetworks].filter(el => el.name !== name)
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      networks: {
        networks: newNetworks,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export const editNetwork = async (name: string, cidr: string): Promise<AxiosResponse> => {
  const currentNetworks = (await getNetworks()).data.networks
  const newNetworks = [...currentNetworks]
  const editedNetworkIndex = newNetworks.findIndex(el => el.name === name)
  newNetworks[editedNetworkIndex] = {
    name,
    network: {
      CIDR: cidr,
    },
  }
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      networks: {
        networks: newNetworks,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}
