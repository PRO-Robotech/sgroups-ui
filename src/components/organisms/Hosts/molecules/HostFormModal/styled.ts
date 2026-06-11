import styled from 'styled-components'

export const ModalContent = styled.div`
  display: grid;
  grid-template-columns: minmax(356px, 534px) minmax(280px, 450px);
  gap: 24px;
  align-items: stretch;
  height: min(720px, calc(100vh - 180px));
  min-height: 0;

  @media (width <= 720px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

export const LoadingState = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
`

export const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;

  .ant-form-item {
    margin-bottom: 8px;
  }

  .ant-form {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-right: 4px;
  }
`

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 24px;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  min-height: 32px;
`

export const Overview = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
  overflow: hidden;
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
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 28px 8px 16px;
`

export const OverviewEmpty = styled.div`
  padding: 0 8px;
`

export const TreeContainer = styled.div`
  padding: 0 8px;
  overflow-y: auto;

  .ant-tree {
    background: transparent;
  }

  .ant-tree-switcher_close .ant-tree-switcher-line-icon svg {
    transform: rotate(-90deg);
  }

  .ant-tree-switcher {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ant-tree .ant-tree-node-content-wrapper {
    overflow-wrap: anywhere;
  }
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

export const Styled = {
  ModalContent,
  LoadingState,
  FormColumn,
  Header,
  Overview,
  OverviewTitle,
  OverviewBody,
  OverviewEmpty,
  TreeContainer,
  Count,
}
