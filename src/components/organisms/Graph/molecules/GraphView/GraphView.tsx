import React, { FC } from 'react'
import { ReactFlowProvider } from 'reactflow'
import { TEntry } from 'localTypes/graph'
import { HighLevelFlow, StarFlow, PortsFlow, NetworksFlow, LowLevelFlow } from './molecules'
import { Styled } from './styled'

type TGraphViewProps = {
  data: TEntry[]
  onSelectSg: (values: string[]) => void
  selectedSg: string[]
  onSelectPort: (port: string) => void
  onSelectNW: (nw: string) => void
  viewType: string | number
  isExtended: boolean
  selectedNW?: string
}

export const GraphView: FC<TGraphViewProps> = ({
  data,
  onSelectSg,
  selectedSg,
  onSelectPort,
  onSelectNW,
  viewType,
  isExtended,
  selectedNW,
}) => (
  <Styled.Background>
    <Styled.ReactFlowContainer $isHighLevel={viewType === 'High Level'}>
      <ReactFlowProvider>
        {viewType === 'High Level' && (
          <HighLevelFlow
            key={data.map(({ uuid }) => uuid).join()}
            data={data}
            selectedSg={selectedSg}
            onSelectSg={onSelectSg}
            selectedNW={selectedNW}
            isExtended={isExtended}
          />
        )}
        {viewType === 'Star' && (
          <StarFlow
            key={data.map(({ uuid }) => uuid).join()}
            data={data}
            selectedSg={selectedSg}
            onSelectSg={onSelectSg}
            selectedNW={selectedNW}
            isExtended={isExtended}
          />
        )}
        {viewType === 'Ports' && (
          <PortsFlow
            key={data.map(({ uuid }) => uuid).join()}
            data={data}
            selectedSg={selectedSg}
            onSelectPort={onSelectPort}
            selectedNW={selectedNW}
            isExtended={isExtended}
          />
        )}
        {viewType === 'Networks' && (
          <NetworksFlow
            key={data.map(({ uuid }) => uuid).join()}
            data={data}
            selectedSg={selectedSg}
            onSelectPort={onSelectPort}
            onSelectNW={onSelectNW}
            selectedNW={selectedNW}
            isExtended={isExtended}
          />
        )}
        {viewType === 'Low Level' && (
          <LowLevelFlow
            key={data.map(({ uuid }) => uuid).join()}
            data={data}
            selectedSg={selectedSg}
            selectedNW={selectedNW}
            isExtended={isExtended}
          />
        )}
      </ReactFlowProvider>
    </Styled.ReactFlowContainer>
  </Styled.Background>
)
