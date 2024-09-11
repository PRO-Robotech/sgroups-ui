import styled from 'styled-components'
import { InfoCircleOutlined } from '@ant-design/icons'

const Container = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: calc((100vh - 65px - 57px) / 2 - 26px);
`

type TIconProps = {
  $isDark?: boolean
}

const Icon = styled(InfoCircleOutlined)<TIconProps>`
  margin-bottom: 4px;
  color: ${({ $isDark }) => ($isDark ? '#E3E3E3' : '#00000040')};
  font-size: 24px;
`

type TTextProps = {
  $isDark?: boolean
}

const Text = styled.div<TTextProps>`
  color: ${({ $isDark }) => ($isDark ? '#E3E3E3' : '#00000040')};
  font-size: 16px;
  line-height: 24px;
`

export const Styled = {
  Container,
  Icon,
  Text,
}
