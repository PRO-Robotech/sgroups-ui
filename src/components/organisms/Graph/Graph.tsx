import React, { FC, useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { Empty, Result, Spin } from 'antd'
import { Spacer } from 'components'
import { TEntry, TFilter, THistoryAction } from 'localTypes/graph'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { getSgSgRules } from 'api/rules'
import { getSecurityGroups } from 'api/securityGroups'
import { GraphControls, GraphView, SgNwControls, FiltersBlock, TableView } from './molecules'
import { mapRulesAndSgToEntries, filterData, filterForSelected } from './utils'
import { Styled } from './styled'

export const Graph: FC = () => {
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [data, setData] = useState<TEntry[]>([])
  const [filteredData, setFilteredData] = useState<TEntry[]>([])
  const [filters, setFilters] = useState<TFilter>()
  const [selectedSg, setSelectedSg] = useState<string[]>([])
  const [dstPort, setDstPort] = useState<string>()
  const [srcPort, setSrcPort] = useState<string>()
  const [selectedNW, setSelectedNW] = useState<string>()
  const [viewType, setViewType] = useState<string | number>('High Level')
  const [historyActions, setHistoryActions] = useState<THistoryAction[]>([])
  const [isExtended, setIsExtended] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    setData([])
    Promise.all([getSgSgRules(), getSecurityGroups()])
      .then(([rules, sg]) => {
        setIsLoading(false)
        setData(mapRulesAndSgToEntries(rules.data.rules, sg.data.groups))
      })
      .catch((error: AxiosError<TRequestErrorData>) => {
        setIsLoading(false)
        if (error.response) {
          setError({ status: error.response.status, data: error.response.data })
        } else if (error.status) {
          setError({ status: error.status })
        } else {
          setError({ status: 'Error while fetching' })
        }
      })
  }, [])

  useEffect(() => {
    setFilteredData(filterForSelected(filterData(data, filters), selectedSg, selectedNW))
  }, [data, filters, selectedSg, selectedNW])

  const onSelectSg = (values: string[]) => {
    const filteredValues = values.filter(el => el)
    if (filteredValues.length === 2) {
      setViewType('Ports')
    }
    if (filteredValues.length === 1) {
      setViewType('Star')
    }
    if (filteredValues.length === 0) {
      setViewType('High Level')
    }
    if (filteredValues.length !== 2 && selectedNW) {
      setSelectedNW(undefined)
      setHistoryActions([
        ...historyActions,
        { type: 'selectNW', prevValue: selectedNW },
        { type: 'selectSG', prevValue: selectedSg },
      ])
    } else {
      setHistoryActions([...historyActions, { type: 'selectSG', prevValue: selectedSg }])
    }
    setSelectedSg(filteredValues)
  }

  const onSelectPort = (port: string) => {
    const type = data.some(el => el.src_port === port) ? 'src' : 'dst'
    if (type === 'src') {
      setHistoryActions([...historyActions, { type: 'selectSrcPort', prevValue: filters?.src_port }])
      setFilters({ ...filters, src_port: port })
      setSrcPort(port)
    }
    if (type === 'dst') {
      setHistoryActions([...historyActions, { type: 'selectDstPort', prevValue: filters?.dst_port }])
      setFilters({ ...filters, dst_port: port })
      setDstPort(port)
    }
  }

  const onFilterChange = (newFilters?: TFilter, changedValues?: TFilter): void => {
    if (!newFilters) {
      setSrcPort(undefined)
      setDstPort(undefined)
    } else {
      if (changedValues?.src_port) {
        setSrcPort(newFilters.src_port)
      }
      if (changedValues?.dst_port) {
        setDstPort(newFilters.dst_port)
      }
    }
    setFilters(newFilters)
  }

  const onReset = () => {
    setFilters(undefined)
    setSelectedSg([])
    setSelectedNW(undefined)
    setSrcPort(undefined)
    setDstPort(undefined)
    setHistoryActions([])
    setViewType('High Level')
  }

  const onSelectNW = (nw?: string) => {
    setHistoryActions([...historyActions, { type: 'selectNW', prevValue: selectedNW }])
    setSelectedNW(nw)
    if (nw) {
      setViewType('Low Level')
    } else {
      setViewType('Networks')
    }
  }

  const onViewTypeChange = (value: string | number) => {
    setHistoryActions([...historyActions, { type: 'changeView', prevValue: viewType }])
    setViewType(value)
  }

  const revertHistoryAction = () => {
    const actions: THistoryAction[] = historyActions
    if (historyActions.length > 0) {
      const lastAction = actions[actions.length - 1]
      if (lastAction.type === 'changeView') {
        setViewType(lastAction.prevValue)
      }
      if (lastAction.type === 'selectSG') {
        if (lastAction.prevValue.length === 2) {
          setViewType('Ports')
        }
        if (lastAction.prevValue.length === 1) {
          setViewType('Star')
        }
        if (lastAction.prevValue.length === 0) {
          setViewType('High Level')
        }
        setSelectedSg(lastAction.prevValue)
      }
      if (lastAction.type === 'selectSrcPort') {
        setSrcPort(lastAction.prevValue)
        setFilters({ ...filters, src_port: lastAction.prevValue })
      }
      if (lastAction.type === 'selectDstPort') {
        setDstPort(lastAction.prevValue)
        setFilters({ ...filters, dst_port: lastAction.prevValue })
      }
      if (lastAction.type === 'selectNW') {
        setSelectedNW(lastAction.prevValue)
        if (lastAction.prevValue) {
          setViewType('Low Level')
        } else {
          setViewType('Networks')
        }
      }
    }
    setHistoryActions(actions.slice(0, -1))
  }

  if (isLoading) {
    return <Spin />
  }
  if (error) {
    return (
      <Result
        status="error"
        title={error.status}
        subTitle={`Code:${error.data?.code}. Message: ${error.data?.message}`}
      />
    )
  }
  if (data.length === 0 && !error && !isLoading) {
    return <Empty />
  }

  return (
    <Styled.Container>
      <Styled.GraphAndFilters>
        <div>
          <GraphControls
            historyActions={historyActions}
            revertHistoryAction={revertHistoryAction}
            selectedSg={selectedSg}
            viewType={viewType}
            onViewTypeChange={onViewTypeChange}
          />
          <Spacer $space={15} $samespace />
          <GraphView
            data={filteredData}
            onSelectSg={onSelectSg}
            selectedSg={selectedSg}
            onSelectPort={onSelectPort}
            onSelectNW={onSelectNW}
            selectedNW={selectedNW}
            viewType={viewType}
            isExtended={isExtended}
          />
        </div>
        <div>
          <Styled.FullHeightCard>
            <SgNwControls
              selectedSg={selectedSg}
              onSelectSg={onSelectSg}
              onSelectNW={onSelectNW}
              selectedNW={selectedNW}
            />
            <Spacer $space={15} $samespace />
            <FiltersBlock
              onFilterChange={onFilterChange}
              resetAll={onReset}
              selectedSg={selectedSg.filter(el => el)}
              dstPort={dstPort}
              srcPort={srcPort}
            />
          </Styled.FullHeightCard>
        </div>
      </Styled.GraphAndFilters>
      <Spacer />
      <TableView data={filteredData} isExtended={isExtended} setIsExtended={setIsExtended} />
    </Styled.Container>
  )
}
