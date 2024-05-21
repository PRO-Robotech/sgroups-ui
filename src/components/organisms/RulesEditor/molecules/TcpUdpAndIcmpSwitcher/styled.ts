import styled from 'styled-components'

const RadioGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`

const GroupRulesNode = styled.div`
  width: 1000px;
  padding: 15px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 24px rgba(23, 49, 65, 0.13);
`

const ContainerAfterSwitcher = styled.div`
  margin-top: -35px;
`

export const Styled = {
  RadioGroup,
  GroupRulesNode,
  ContainerAfterSwitcher,
}
