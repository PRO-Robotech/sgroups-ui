import styled from 'styled-components'

const Container = styled.div`
  width: 333px;
  height: 64px;
  position: fixed;
  bottom: 24px;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  box-shadow: 0px 9px 28px 8px #0000000d;
  /* box-shadow: 0px 3px 6px -4px #0000001f; */
  /* box-shadow: 0px 6px 16px 0px #00000014; */
  padding: 16px;
  border-radius: 8px;
  display: grid;
  grid-template-columns: 1fr 82px;
`

const TextContainer = styled.div`
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  text-align: left;
  display: flex;
  align-items: center;
`

const BlueText = styled.div`
  color: #1677ff;
  margin-left: 6px;
`

export const Styled = {
  Container,
  TextContainer,
  BlueText,
}
