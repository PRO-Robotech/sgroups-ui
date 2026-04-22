import styled from 'styled-components'

export const ModalContent = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 24px;

  @media (width <= 720px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

export const LoadingState = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 480px;
`

export const FormColumn = styled.div`
  min-width: 0;

  .ant-form-item {
    margin-bottom: 8px;
  }
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  margin-bottom: 24px;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
`

export const Overview = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 0;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.04);

  @media (width <= 720px) {
    display: none;
  }
`

export const OverviewTitle = styled.div`
  padding: 0 16px;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
`

export const OverviewBody = styled.div`
  padding: 28px 8px 16px;
`

export const OverviewTree = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 22px;
`

export const OverviewGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const OverviewGroupTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
`

export const OverviewBranch = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 24px;
`

export const OverviewBranchTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const OverviewLeaf = styled.div`
  display: flex;
  align-items: center;
  padding-left: 24px;
`

export const Count = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 8px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.06);
  font-size: 12px;
  line-height: 12px;
`

export const SwitchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
`
