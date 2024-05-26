import styled from 'styled-components'

const Container = styled.div`
  position: absolute;
  top: 100px;
  left: 250px;
  z-index: 2;
  width: calc(100vw - 348px);
  padding: 0 24px 24px 24px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 24px rgba(23, 49, 65, 0.13);
`

const ExitModalContainer = styled.div`
  position: absolute;
  right: 25px;
  top: 15px;
`

export const Styled = {
  Container,
  ExitModalContainer,
}
