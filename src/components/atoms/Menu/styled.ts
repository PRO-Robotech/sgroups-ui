import styled from 'styled-components'
import { Menu } from 'antd'

const CustomMenu = styled(Menu)`
  font-size: 16px;
  line-height: 24px;
  border: 0;
  /* stylelint-disable declaration-no-important */
  border-inline-end: 0 !important;
  /* stylelint-enable declaration-no-important */

  && .ant-menu-item-selected svg,
  && .ant-menu-submenu-selected svg {
    color: #366af3;
  }

  .ant-menu-submenu-expand-icon {
    width: 16px;
  }

  && .ant-menu-item-only-child {
    /* stylelint-disable declaration-no-important */
    padding-left: 64px !important;
    /* stylelint-enable declaration-no-important */
  }
`

export const Styled = {
  CustomMenu,
}
