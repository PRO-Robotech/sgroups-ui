import styled from 'styled-components'
import { Input } from 'antd'

type THeaderRowProps = {
  $isDark: boolean
}

const HeaderRow = styled.div<THeaderRowProps>`
  padding: 16px 24px;
  border-bottom: 1px solid ${({ $isDark }) => ($isDark ? '#3C3C3C' : '#0000000f')};
`

type TControlsRowProps = {
  $isDark: boolean
}

const ControlsRow = styled.div<TControlsRowProps>`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 12px 24px;
  border-bottom: 1px solid ${({ $isDark }) => ($isDark ? '#3C3C3C' : '#0000000f')};
`

const ControlsRightSide = styled.div`
  display: flex;
`

type TSeparatorProps = {
  $isDark: boolean
}

const Separator = styled.div<TSeparatorProps>`
  width: 1px;
  height: 24pcx;
  margin: 0 16px;
  background: ${({ $isDark }) => ($isDark ? '#3C3C3C' : '#0000000f')};
`

const ControlsLeftSide = styled.div`
  display: flex;
  justify-content: flex-end;
`

const SearchControl = styled.div`
  width: 240px;
`

const InputWithCustomPreffixMargin = styled(Input)`
  && .ant-input-prefix {
    margin-inline-end: 10px;
  }
`

export const Layouts = {
  HeaderRow,
  ControlsRow,
  ControlsRightSide,
  Separator,
  ControlsLeftSide,
  SearchControl,
  InputWithCustomPreffixMargin,
}
