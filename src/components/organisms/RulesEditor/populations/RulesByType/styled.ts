import styled from 'styled-components'

const Container = styled.div`
  position: absolute;
  left: 240px;
  z-index: 2;
  width: calc(100vw - 240px);
  max-height: calc(100vh - 74px);
  overflow-y: auto;
`

const Card = styled.div`
  margin-bottom: 40px;
  padding: 16px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 24px rgba(23, 49, 65, 0.13);

  &:nth-last-child() {
    margin-bottom: 0;
  }
`

export const Styled = {
  Container,
  Card,
}
