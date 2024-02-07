export type TEntry = {
  uuid: string
  src_ip: string
  src_port: string
  dst_ip: string
  dst_port: string
  protocol: string
  from: string
  to: string
}

export type TFilter = { [key in keyof Partial<TEntry>]: string }

export type THistoryAction =
  | {
      type: 'changeView'
      prevValue: string | number
    }
  | {
      type: 'selectSG'
      prevValue: string[]
    }
  | {
      type: 'selectSrcPort' | 'selectDstPort'
      prevValue: string | undefined
    }
  | {
      type: 'selectNW'
      prevValue: string | undefined
    }
