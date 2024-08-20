import styled from 'styled-components'
import { Tag } from 'antd'

type TCustomTagProps = {
  $status: string
}

const CustomTag = styled(Tag)<TCustomTagProps>`
  color: ${({ $status }) => {
    if ($status === 'new') {
      return '#52C41A'
    }
    if ($status === 'deleted') {
      return '#FF4D4F'
    }
    return '#1677FF'
  }};
  background: ${({ $status }) => {
    if ($status === 'new') {
      return '#F6FFED'
    }
    if ($status === 'deleted') {
      return '#FFF1F0'
    }
    return '#E6F4FF'
  }};
  border: 1px solid
    ${({ $status }) => {
      if ($status === 'new') {
        return '#B7EB8F'
      }
      if ($status === 'deleted') {
        return '#FFA39E'
      }
      return '#91CAFF'
    }};
`

export const Styled = {
  CustomTag,
}
