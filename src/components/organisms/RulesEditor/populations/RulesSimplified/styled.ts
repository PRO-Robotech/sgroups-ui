import styled from 'styled-components'

const Container = styled.div`
  position: absolute;
  top: 100px;
  left: 250px;
  z-index: 2;
  width: calc(100vw - 348px);
  max-height: calc(100vh - 250px);
  padding: 0 24px 24px 24px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 24px rgba(23, 49, 65, 0.13);
  overflow-y: auto;
`

export const Styled = {
  Container,
}
