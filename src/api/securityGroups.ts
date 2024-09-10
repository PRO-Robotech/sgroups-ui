import axios, { AxiosResponse } from 'axios'
import { TSgResponse, TSgDefaultAction } from 'localTypes/securityGroups'
import { getBaseEndpoint } from './env'

export const getSecurityGroups = (): Promise<AxiosResponse<TSgResponse>> =>
  axios.post<TSgResponse>(`${getBaseEndpoint()}/v2/list-security-groups`)

export const getSecurityGroupByName = (name: string): Promise<AxiosResponse<TSgResponse>> =>
  axios.post<TSgResponse>(
    `${getBaseEndpoint()}/v2/list-security-groups`,
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
  defaultAction: TSgDefaultAction,
  networks: string[],
  logs: boolean,
  trace: boolean,
): Promise<AxiosResponse> => {
  return axios.post(
    `${getBaseEndpoint()}/v2/sync`,
    {
      groups: {
        groups: [
          {
            defaultAction,
            logs,
            name,
            networks,
            trace,
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

export const removeSecurityGroup = async (names: string[]): Promise<AxiosResponse> => {
  const currentSecurityGroups = (await getSecurityGroups()).data.groups
  const deletedSecurityGroups = [...currentSecurityGroups].filter(el => names.includes(el.name))
  return axios.post(
    `${getBaseEndpoint()}/v2/sync`,
    {
      groups: {
        groups: deletedSecurityGroups,
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

export const editSecurityGroup = async (
  name: string,
  defaultAction: TSgDefaultAction,
  networks: string[],
  logs: boolean,
  trace: boolean,
): Promise<AxiosResponse> => {
  const modifiedSecurityGroups = [
    {
      name,
      defaultAction,
      networks,
      logs,
      trace,
    },
  ]
  return axios.post(
    `${getBaseEndpoint()}/2/sync`,
    {
      groups: {
        groups: modifiedSecurityGroups,
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
