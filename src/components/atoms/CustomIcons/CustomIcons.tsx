import styled from 'styled-components'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'

const EditIcon = styled(EditOutlined)`
  transition: color 0.5s ease;

  &:hover {
    color: #1677ff;
  }
`

const DeleteIcon = styled(DeleteOutlined)`
  transition: color 0.5s ease;

  &:hover {
    color: #1677ff;
  }
`

export const CustomIcons = {
  EditIcon,
  DeleteIcon,
}
