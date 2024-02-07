import styled from 'styled-components'
import { Typography } from 'antd'

export const TitleWithNoMargins = styled(Typography.Title)`
  margin-top: 0;
  && {
    margin-bottom: 0;
  }
`
