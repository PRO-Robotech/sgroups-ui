import styled from 'styled-components'

const Container = styled.div`
  position: fixed;
  right: 0;
  bottom: 24px;
  left: 0;
  display: grid;
  grid-template-columns: 1fr 82px;
  width: 333px;
  height: 64px;
  margin-right: auto;
  margin-left: auto;
  /* box-shadow: 0px 3px 6px -4px #0000001f; */
  /* box-shadow: 0px 6px 16px 0px #00000014; */
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0px 9px 28px 8px #0000000d;
`

const TextContainer = styled.div`
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  text-align: left;
`

const BlueText = styled.div`
  margin-left: 6px;
  color: #1677ff;
`

export const Styled = {
  Container,
  TextContainer,
  BlueText,
}
