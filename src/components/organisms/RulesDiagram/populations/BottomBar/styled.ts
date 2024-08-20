import styled from 'styled-components'

type TContainerProps = {
  $isOpen: boolean
}

const Container = styled.div<TContainerProps>`
  position: absolute;
  bottom: 0;
  left: 240px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100vw - 288px);
  height: ${({ $isOpen }) => ($isOpen ? '90vh' : '50px')};
  padding: 24px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 24px rgba(23, 49, 65, 0.13);
`

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const FlexContainerItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
`

export const Styled = {
  Container,
  FlexContainer,
  FlexContainerItem,
}
