import axios, { AxiosResponse } from 'axios'
import {
  TSgSgRulesResponse,
  TSgSgIcmpRulesResponse,
  TSgSgIeRulesResponse,
  TSgSgIeIcmpRulesResponse,
  TSgFqdnRulesResponse,
  TSgCidrRulesResponse,
  TSgCidrIcmpRulesResponse,
  TSgSgRule,
  TSgSgIcmpRule,
  TSgSgIeRule,
  TSgSgIeIcmpRule,
  TSgFqdnRule,
  TSgCidrRule,
  TSgCidrIcmpRule,
} from 'localTypes/rules'
import { getBaseEndpoint } from './env'

export const getSgSgRules = (): Promise<AxiosResponse<TSgSgRulesResponse>> =>
  axios.post<TSgSgRulesResponse>(`${getBaseEndpoint()}/v2/sg-sg-rules`)

export const getSgSgRulesBySgFrom = (sg: string): Promise<AxiosResponse<TSgSgRulesResponse>> =>
  axios.post<TSgSgRulesResponse>(
    `${getBaseEndpoint()}/v2/sg-sg-rules`,
    {
      sgFrom: [sg],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const getSgSgRulesBySgTo = (sg: string): Promise<AxiosResponse<TSgSgRulesResponse>> =>
  axios.post<TSgSgRulesResponse>(
    `${getBaseEndpoint()}/v2/sg-sg-rules`,
    {
      sgTo: [sg],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const removeSgSgRule = async (sgFrom: string, sgTo: string): Promise<AxiosResponse> => {
  const currentRules = (await getSgSgRules()).data.rules
  const removedRules = [...currentRules].filter(el => el.sgFrom === sgFrom && el.sgTo === sgTo)
  return axios.post(
    `${getBaseEndpoint()}/v2/sync`,
    {
      sgSgRules: {
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

export const getSgSgIcmpRules = (): Promise<AxiosResponse<TSgSgIcmpRulesResponse>> =>
  axios.post<TSgSgIcmpRulesResponse>(`${getBaseEndpoint()}/v2/sg-sg-icmp-rules`)

export const getSgSgIcmpRulesBySgFrom = (sg: string): Promise<AxiosResponse<TSgSgIcmpRulesResponse>> =>
  axios.post<TSgSgIcmpRulesResponse>(
    `${getBaseEndpoint()}/v2/sg-sg-icmp-rules`,
    {
      sgFrom: [sg],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const getSgSgIcmpRulesBySgTo = (sg: string): Promise<AxiosResponse<TSgSgIcmpRulesResponse>> =>
  axios.post<TSgSgIcmpRulesResponse>(
    `${getBaseEndpoint()}/v2/sg-sg-icmp-rules`,
    {
      sgTo: [sg],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const removeSgSgIcmpRule = async (sgFrom: string, sgTo: string): Promise<AxiosResponse> => {
  const currentRules = (await getSgSgIcmpRules()).data.rules
  const removedRules = [...currentRules].filter(el => el.sgFrom === sgFrom && el.sgTo === sgTo)
  return axios.post(
    `${getBaseEndpoint()}/v2/sync`,
    {
      sgSgIcmpRules: {
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

export const getSgSgIeRules = (): Promise<AxiosResponse<TSgSgIeRulesResponse>> =>
  axios.post<TSgSgIeRulesResponse>(`${getBaseEndpoint()}/v2/ie-sg-sg-rules`)

export const getSgSgIeRulesBySgLocal = (sg: string): Promise<AxiosResponse<TSgSgIeRulesResponse>> =>
  axios.post<TSgSgIeRulesResponse>(
    `${getBaseEndpoint()}/v2/ie-sg-sg-rules`,
    {
      sgLocal: [sg],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const removeSgSgIeRule = async (sgFrom: string, sgTo: string): Promise<AxiosResponse> => {
  const currentRules = (await getSgSgIeRules()).data.rules
  const removedRules = [...currentRules].filter(el => el.sgLocal === sgFrom && el.SG === sgTo)
  return axios.post(
    `${getBaseEndpoint()}/v2/sync`,
    {
      ieSgSgRules: {
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

export const getSgSgIeIcmpRules = (): Promise<AxiosResponse<TSgSgIeIcmpRulesResponse>> =>
  axios.post<TSgSgIeIcmpRulesResponse>(`${getBaseEndpoint()}/v2/ie-sg-sg-icmp-rules`)

export const getSgSgIeIcmpRulesBySgLocal = (sg: string): Promise<AxiosResponse<TSgSgIeIcmpRulesResponse>> =>
  axios.post<TSgSgIeIcmpRulesResponse>(
    `${getBaseEndpoint()}/v2/ie-sg-sg-icmp-rules`,
    {
      sgLocal: [sg],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const removeSgSgIeIcmpRule = async (sgFrom: string, sgTo: string): Promise<AxiosResponse> => {
  const currentRules = (await getSgSgIeIcmpRules()).data.rules
  const removedRules = [...currentRules].filter(el => el.sgLocal === sgFrom && el.SG === sgTo)
  return axios.post(
    `${getBaseEndpoint()}/v2/sync`,
    {
      ieSgSgIcmpRules: {
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

export const getSgFqdnRules = (): Promise<AxiosResponse<TSgFqdnRulesResponse>> =>
  axios.post<TSgFqdnRulesResponse>(`${getBaseEndpoint()}/v2/fqdn-rules`)

export const getSgFqdnRulesBySgFrom = (sg: string): Promise<AxiosResponse<TSgFqdnRulesResponse>> =>
  axios.post<TSgFqdnRulesResponse>(
    `${getBaseEndpoint()}/v2/fqdn-rules`,
    {
      sgFrom: [sg],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const removeSgFqdnRule = async (sgFrom: string, FQDN: string): Promise<AxiosResponse> => {
  const currentRules = (await getSgFqdnRules()).data.rules
  const removedRules = [...currentRules].filter(el => el.sgFrom === sgFrom && el.FQDN === FQDN)
  return axios.post(
    `${getBaseEndpoint()}/v2/sync`,
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

export const getSgCidrRules = (): Promise<AxiosResponse<TSgCidrRulesResponse>> =>
  axios.post<TSgCidrRulesResponse>(`${getBaseEndpoint()}/v2/ie-cidr-sg-rules`)

export const getSgCidrRulesBySg = (sg: string): Promise<AxiosResponse<TSgCidrRulesResponse>> =>
  axios.post<TSgCidrRulesResponse>(
    `${getBaseEndpoint()}/v2/ie-cidr-sg-rules`,
    {
      SG: [sg],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const removeSgCidrRule = async (SG: string, CIDR: string): Promise<AxiosResponse> => {
  const currentRules = (await getSgCidrRules()).data.rules
  const removedRules = [...currentRules].filter(el => el.SG === SG && el.CIDR === CIDR)
  return axios.post(
    `${getBaseEndpoint()}/v2/sync`,
    {
      ieCidrSgRules: {
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

export const getSgCidrIcmpRules = (): Promise<AxiosResponse<TSgCidrIcmpRulesResponse>> =>
  axios.post<TSgCidrIcmpRulesResponse>(`${getBaseEndpoint()}/v2/ie-cidr-sg-icmp-rules`)

export const getSgCidrIcmpRulesBySg = (sg: string): Promise<AxiosResponse<TSgCidrIcmpRulesResponse>> =>
  axios.post<TSgCidrIcmpRulesResponse>(
    `${getBaseEndpoint()}/v2/ie-cidr-sg-icmp-rules`,
    {
      SG: [sg],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

export const removeSgCidrIcmpRule = async (sg: string, CIDR: string): Promise<AxiosResponse> => {
  const currentRules = (await getSgCidrIcmpRules()).data.rules
  const removedRules = [...currentRules].filter(el => el.SG === sg && el.CIDR === CIDR)
  return axios.post(
    `${getBaseEndpoint()}/v2/sync`,
    {
      ieCidrSgIcmpRules: {
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
  sgSgRules: TSgSgRule[],
  sgSgIcmpRules: TSgSgIcmpRule[],
  sgSgIeRules: TSgSgIeRule[],
  sgSgIeIcmpRules: TSgSgIeIcmpRule[],
  sgFqdnRules: TSgFqdnRule[],
  sgCidrRules: TSgCidrRule[],
  sgCidrIcmpRules: TSgCidrIcmpRule[],
): Promise<AxiosResponse[] | void> => {
  if (
    sgSgRules.length > 0 ||
    sgSgIcmpRules.length > 0 ||
    sgSgIeRules.length > 0 ||
    sgSgIeIcmpRules.length > 0 ||
    sgFqdnRules.length > 0 ||
    sgCidrRules.length > 0 ||
    sgCidrIcmpRules.length > 0
  ) {
    /* limitations of current API
    const body: {
      sgSgRules?: { rules: TSgRule[] }
      sgSgIcmpRules?: {rules: TSgSgIcmpRule[] }
      sgSgIeRules?: {rules: TSgSgIeRule[] }
      sgSgIeIcmpRules?: {rules: TSgSgIeIcmpRule[] }
      sgFqdnRules?: { rules: TFqdnRule[] }
      sgCidrRules?: { rules: TCidrRule[] }
      sgCidrIcmpRules?: {rules: TCidrSgIcmpRule[] }
    } = {}
    if (sgSgRules.length > 0) {
      body.sgRules = { rules: sgSgRules }
    }
    if (sgSgIcmpRules.length > 0) {
      body.sgSgIcmpRules = { rules: sgSgIcmpRules }
    }
    if (sgSgIeRules.length > 0) {
      body.sgSgRules = { rules: sgSgIeRules }
    }
    if (sgSgIeIcmpRules.length > 0) {
      body.ieSgSgIcmpRules = { rules: sgSgIeIcmpRules }
    }
    if (sgFqdnRules.length > 0) {
      body.fqdnRules = { rules: sgFqdnRules }
    }
    if (sgCidrRules.length > 0) {
      body.cidrSgRules = { rules: sgCidrRules }
    }
    if (sgCidrIcmpRules.length > 0) {
      body.cidrSgIcmpRules = { rules: sgCidrIcmpRules }
    }
    return axios.post(
      `${getBaseEndpoint()}/v2/sync`,
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
    if (sgSgRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v2/sync`,
          {
            sgSgRules: {
              rules: sgSgRules,
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
    if (sgSgIcmpRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v2/sync`,
          {
            sgSgIcmpRules: {
              rules: sgSgIcmpRules,
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
    if (sgSgIeRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v2/sync`,
          {
            ieSgSgRules: {
              rules: sgSgIeRules,
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
    if (sgSgIeIcmpRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v2/sync`,
          {
            ieSgSgIcmpRules: {
              rules: sgSgIeIcmpRules,
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

    if (sgFqdnRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v2/sync`,
          {
            fqdnRules: {
              rules: sgFqdnRules,
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
    if (sgCidrRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v2/sync`,
          {
            ieCidrSgRules: {
              rules: sgCidrRules,
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
    if (sgCidrIcmpRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v2/sync`,
          {
            ieCidrSgIcmpRules: {
              rules: sgCidrIcmpRules,
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
  sgSgRules: TSgSgRule[],
  sgSgIcmpRules: TSgSgIcmpRule[],
  sgSgIeRules: TSgSgIeRule[],
  sgSgIeIcmpRules: TSgSgIeIcmpRule[],
  sgFqdnRules: TSgFqdnRule[],
  sgCidrRules: TSgCidrRule[],
  sgCidrIcmpRules: TSgCidrIcmpRule[],
): Promise<AxiosResponse[] | void> => {
  if (
    sgSgRules.length > 0 ||
    sgSgIcmpRules.length > 0 ||
    sgSgIeRules.length > 0 ||
    sgSgIeIcmpRules.length > 0 ||
    sgFqdnRules.length > 0 ||
    sgCidrRules.length > 0 ||
    sgCidrIcmpRules.length > 0
  ) {
    /* limitations of current API
    const body: {
      sgSgRules?: { rules: TSgRule[] }
      sgSgIcmpRules?: { rules: TSgSgIcmpRule[] }
      sgSgIeRules?: { rules: TSgSgIeRule[] }
      sgSgIeIcmpRules?: { rules: TSgSgIeIcmpRule[] }
      sgFqdnRules?: { rules: TFqdnRule[] }
      sgCidrRules?: { rules: TCidrRule[] }
      sgCidrIcmpRules?: { rules: cidrSgIcmpRules[] }
    } = {}
    if (sgSgRules.length > 0) {
      body.sgRules = { rules: sgSgRules }
    }
    if (sgSgIcmpRules.length > 0) {
      body.sgSgIcmpRules = { rules: sgSgIcmpRules }
    }
    if (sgSgIeRules.length > 0) {
      body.sgSgRules = { rules: sgSgIeRules }
    }
    if (sgSgIeIcmpRules.length > 0) {
      body.ieSgSgIcmpRules = { rules: sgSgIeIcmpRules }
    }
    if (sgFqdnRules.length > 0) {
      body.fqdnRules = { rules: sgFqdnRules }
    }
    if (sgCidrRules.length > 0) {
      body.cidrSgRules = { rules: sgCidrRules }
    }
    if (sgCidrIcmpRules.length > 0) {
      body.cidrSgIcmpRules = { rules: sgCidrIcmpRules }
    }
    return axios.post(
      `${getBaseEndpoint()}/v2/sync`,
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
    */
    const PromiseArr = []
    if (sgSgRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v2/sync`,
          {
            sgSgRules: {
              rules: sgSgRules,
            },
            syncOp: 'Delete',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      )
    }
    if (sgSgIcmpRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v2/sync`,
          {
            sgSgIcmpRules: {
              rules: sgSgIcmpRules,
            },
            syncOp: 'Delete',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      )
    }
    if (sgSgIeRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v2/sync`,
          {
            ieSgSgRules: {
              rules: sgSgIeRules,
            },
            syncOp: 'Delete',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      )
    }
    if (sgSgIeIcmpRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v2/sync`,
          {
            ieSgSgIcmpRules: {
              rules: sgSgIeIcmpRules,
            },
            syncOp: 'Delete',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      )
    }
    if (sgFqdnRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v2/sync`,
          {
            fqdnRules: {
              rules: sgFqdnRules,
            },
            syncOp: 'Delete',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      )
    }
    if (sgCidrRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v2/sync`,
          {
            ieCidrSgRules: {
              rules: sgCidrRules,
            },
            syncOp: 'Delete',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      )
    }
    if (sgCidrIcmpRules.length > 0) {
      PromiseArr.push(
        axios.post(
          `${getBaseEndpoint()}/v2/sync`,
          {
            ieCidrSgIcmpRules: {
              rules: sgCidrIcmpRules,
            },
            syncOp: 'Delete',
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
