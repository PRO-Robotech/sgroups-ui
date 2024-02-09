import axios, { AxiosResponse } from 'axios'
import {
  TSgRulesResponse,
  TFqdnRulesResponse,
  TCidrRulesResponse,
  TSgRule,
  TFqdnRule,
  TCidrRule,
} from 'localTypes/rules'
import { getBaseEndpoint } from './env'

export const getRules = (): Promise<AxiosResponse<TSgRulesResponse>> =>
  axios.post<TSgRulesResponse>(`${getBaseEndpoint()}/v1/rules`)

export const getRulesBySGFrom = (sg: string): Promise<AxiosResponse<TSgRulesResponse>> =>
  axios.post<TSgRulesResponse>(
    `${getBaseEndpoint()}/v1/rules`,
    {
      sgFrom: [sg],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const getRulesBySGTo = (sg: string): Promise<AxiosResponse<TSgRulesResponse>> =>
  axios.post<TSgRulesResponse>(
    `${getBaseEndpoint()}/v1/rules`,
    {
      sgTo: [sg],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const removeRule = async (sgFrom: string, sgTo: string): Promise<AxiosResponse> => {
  const currentRules = (await getRules()).data.rules
  const removedRules = [...currentRules].filter(el => el.sgFrom === sgFrom && el.sgTo === sgTo)
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      sgRules: {
        rules: removedRules,
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

export const getFqdnRules = (): Promise<AxiosResponse<TFqdnRulesResponse>> =>
  axios.post<TFqdnRulesResponse>(`${getBaseEndpoint()}/v1/fqdn/rules`)

export const getFqdnRulesBySGFrom = (sg: string): Promise<AxiosResponse<TFqdnRulesResponse>> =>
  axios.post<TFqdnRulesResponse>(
    `${getBaseEndpoint()}/v1/fqdn/rules`,
    {
      sgFrom: [sg],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const removeFqdnRule = async (sgFrom: string, FQDN: string): Promise<AxiosResponse> => {
  const currentRules = (await getFqdnRules()).data.rules
  const removedRules = [...currentRules].filter(el => el.sgFrom === sgFrom && el.FQDN === FQDN)
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      fqdnRules: {
        rules: removedRules,
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

export const getCidrSgRules = (): Promise<AxiosResponse<TCidrRulesResponse>> =>
  axios.post<TCidrRulesResponse>(`${getBaseEndpoint()}/v1/cird-sg/rules`)

export const getCidrSgRulesBySG = (sg: string): Promise<AxiosResponse<TCidrRulesResponse>> =>
  axios.post<TCidrRulesResponse>(
    `${getBaseEndpoint()}/v1/cird-sg/rules`,
    {
      sg: [sg],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const removeCidrSgRule = async (SG: string, CIDR: string): Promise<AxiosResponse> => {
  const currentRules = (await getCidrSgRules()).data.rules
  const removedRules = [...currentRules].filter(el => el.SG === SG && el.CIDR === CIDR)
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      cidrSgRules: {
        rules: removedRules,
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

export const upsertRules = async (
  sgRules: TSgRule[],
  fqdnRules: TFqdnRule[],
  cidrSgRules: TCidrRule[],
): Promise<AxiosResponse[] | void> => {
  if (sgRules.length > 0 || fqdnRules.length > 0 || cidrSgRules.length > 0) {
    /* limitations of current API
    const body: {
      sgRules?: { rules: TSgRule[] }
      fqdnRules?: { rules: TFqdnRule[] }
      cidrSgRules?: { rules: TCidrRule[] }
    } = {}
    if (sgRules.length > 0) {
      body.sgRules = { rules: sgRules }
    }
    if (fqdnRules.length > 0) {
      body.fqdnRules = { rules: fqdnRules }
    }
    if (cidrSgRules.length > 0) {
      body.cidrSgRules = { rules: cidrSgRules }
    }
    return axios.post(
      `${getBaseEndpoint()}/v1/sync`,
      {
        ...body,
        syncOp: 'Upsert',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ) */
    const PromiseArr = []
    if (sgRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v1/sync`,
          {
            sgRules: {
              rules: sgRules,
            },
            syncOp: 'Upsert',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      )
    }
    if (fqdnRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v1/sync`,
          {
            fqdnRules: {
              rules: fqdnRules,
            },
            syncOp: 'Upsert',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      )
    }
    if (cidrSgRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v1/sync`,
          {
            cidrSgRules: {
              rules: cidrSgRules,
            },
            syncOp: 'Upsert',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      )
    }
    return Promise.all([...PromiseArr])
  }
  return Promise.resolve()
}

export const deleteRules = async (
  sgRules: TSgRule[],
  fqdnRules: TFqdnRule[],
  cidrSgRules: TCidrRule[],
): Promise<AxiosResponse | void> => {
  if (sgRules.length > 0 || fqdnRules.length > 0 || cidrSgRules.length > 0) {
    const body: {
      sgRules?: { rules: TSgRule[] }
      fqdnRules?: { rules: TFqdnRule[] }
      cidrSgRules?: { rules: TCidrRule[] }
    } = {}
    if (sgRules.length > 0) {
      body.sgRules = { rules: sgRules }
    }
    if (fqdnRules.length > 0) {
      body.fqdnRules = { rules: fqdnRules }
    }
    if (cidrSgRules.length > 0) {
      body.cidrSgRules = { rules: cidrSgRules }
    }
    return axios.post(
      `${getBaseEndpoint()}/v1/sync`,
      {
        ...body,
        syncOp: 'Delete',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }
  return Promise.resolve()
}

/*
export const addRules = async (rules: TSgRule[]): Promise<AxiosResponse> => {
  const currentRules = (await getRules()).data.rules
  const newRules = [...currentRules, ...rules]
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      sgRules: {
        rules: newRules,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export const editRule = async (sourceRule: TSgRule, editedRule: TSgRule): Promise<AxiosResponse> => {
  const currentRules = (await getRules()).data.rules
  const newRules = [...currentRules]
  const editedRuleIndex = newRules.findIndex(el => el.sgFrom === sourceRule.sgFrom && el.sgTo === sourceRule.sgTo)
  newRules[editedRuleIndex] = { ...editedRule }
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      sgRules: {
        rules: newRules,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export const addFqdnRules = async (rules: TFqdnRule[]): Promise<AxiosResponse> => {
  const currentRules = (await getFqdnRules()).data.rules
  const newRules = [...currentRules, ...rules]
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      fqdnRules: {
        rules: newRules,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export const editFqdnRule = async (sourceRule: TFqdnRule, editedRule: TFqdnRule): Promise<AxiosResponse> => {
  const currentRules = (await getFqdnRules()).data.rules
  const newRules = [...currentRules]
  const editedRuleIndex = newRules.findIndex(el => el.sgFrom === sourceRule.sgFrom && el.FQDN === sourceRule.FQDN)
  newRules[editedRuleIndex] = { ...editedRule }
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      fqdnRules: {
        rules: newRules,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export const addCidrSgRules = async (rules: TCidrRule[]): Promise<AxiosResponse> => {
  const currentRules = (await getCidrSgRules()).data.rules
  const newRules = [...currentRules, ...rules]
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      cidrSgRules: {
        rules: newRules,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export const editCidrSgRule = async (sourceRule: TCidrRule, editedRule: TCidrRule): Promise<AxiosResponse> => {
  const currentRules = (await getCidrSgRules()).data.rules
  const newRules = [...currentRules]
  const editedRuleIndex = newRules.findIndex(el => el.SG === sourceRule.SG && el.CIDR === sourceRule.CIDR)
  newRules[editedRuleIndex] = { ...editedRule }
  return axios.post(
    `${getBaseEndpoint()}/v1/sync`,
    {
      cidrSgRules: {
        rules: newRules,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}
*/
