import React, { FC } from 'react'
import { Button } from 'antd'
import { FullscreenExitOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from 'store/store'
import { setSpecific } from 'store/editor/specific/specific'
import { SelectCenterSg } from '../../molecules'
import { Styled } from './styled'
import { SgSg, SgSgIe, SgFqdn, SgCidr } from './organisms'

type TRulesSpecificProps = {
  onSelectCenterSg: (value?: string) => void
}

export const RulesSpecific: FC<TRulesSpecificProps> = ({ onSelectCenterSg }) => {
  const specificValue = useSelector((state: RootState) => state.specific.specificValue)
  const dispatch = useDispatch()

  return (
    <Styled.Container>
      <Styled.ExitModalContainer>
        <Button
          onClick={() => {
            dispatch(setSpecific({ specificOpen: false, specificValue: undefined }))
          }}
        >
          <FullscreenExitOutlined />
        </Button>
      </Styled.ExitModalContainer>
      <SelectCenterSg onSelectCenterSg={onSelectCenterSg} notInTransformBlock />
      {specificValue === 'sgSg' && <SgSg />}
      {specificValue === 'sgSgIe' && <SgSgIe />}
      {specificValue === 'sgFqdn' && <SgFqdn />}
      {specificValue === 'sgCidr' && <SgCidr />}
    </Styled.Container>
  )
}
