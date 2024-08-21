import styled from 'styled-components'
import { Tag } from 'antd'

type TCustomTagProps = {
  $isAccept?: boolean
}

const CustomTag = styled(Tag)<TCustomTagProps>`
  color: ${({ $isAccept }) => ($isAccept ? '#52C41A' : '#FF4D4F')};
  background: ${({ $isAccept }) => ($isAccept ? '#F6FFED' : '#FFF1F0')};
  border: 1px solid ${({ $isAccept }) => ($isAccept ? '#B7EB8F' : '#FFA39E')};
`

export const Styled = {
  CustomTag,
}
