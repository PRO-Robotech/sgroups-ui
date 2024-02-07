import axios, { AxiosResponse } from 'axios'
import { TSGResponse, TSGDefaultAction } from 'localTypes/securityGroups'
import { getBaseEndpoint } from './env'

export const getSecurityGroups = (): Promise<AxiosResponse<TSGResponse>> =>
  axios.post<TSGResponse>(`${getBaseEndpoint()}/v1/list/security-groups`)

export const getSecurityGroupByName = (name: string): Promise<AxiosResponse<TSGResponse>> =>
  axios.post<TSGResponse>(
    `${getBaseEndpoint()}/v1/list/security-groups`,
    {
      sgNames: [name],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const addSecurityGroup = async (
  name: string,
  defaultAction: TSGDefaultAction,
  networks: string[],
  logs: boolean,
  trace: boolean,
): Promise<AxiosResponse> => {
  const currentSecurityGroups = (await getSecurityGroups()).data.groups
  const newSecurityGroups = [
    ...currentSecurityGroups,
    {
      defaultAction,
      logs,
      name,
      networks,
      trace,
    },
  ]
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      groups: {
        groups: newSecurityGroups,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export const removeSecurityGroup = async (name: string): Promise<AxiosResponse> => {
  const currentSecurityGroups = (await getSecurityGroups()).data.groups
  const newSecurityGroups = [...currentSecurityGroups].filter(el => el.name !== name)
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      groups: {
        groups: newSecurityGroups,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export const editSecurityGroup = async (
  name: string,
  defaultAction: TSGDefaultAction,
  networks: string[],
  logs: boolean,
  trace: boolean,
): Promise<AxiosResponse> => {
  const securityGroups = (await getSecurityGroups()).data.groups
  const newSecurityGroups = [...securityGroups]
  const editedSecurityGroupIndex = newSecurityGroups.findIndex(el => el.name === name)
  newSecurityGroups[editedSecurityGroupIndex] = {
    name,
    defaultAction,
    networks,
    logs,
    trace,
  }
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      groups: {
        groups: newSecurityGroups,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}
