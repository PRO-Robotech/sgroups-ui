import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import { renderTableActionsDropdown } from './renderTableActionsDropdown'

describe('renderTableActionsDropdown', () => {
  const record = { id: 'row-a' }

  it('renders a compact dots action button', () => {
    render(renderTableActionsDropdown({ label: 'Row A', onEdit: jest.fn(), record }))

    const button = screen.getByRole('button', { name: /actions for row a/i })

    expect(button).toHaveClass('ant-btn-sm')
    expect(button).toHaveClass('ant-btn-icon-only')
  })

  it('calls edit and delete handlers from menu items', async () => {
    const onDelete = jest.fn()
    const onEdit = jest.fn()

    render(renderTableActionsDropdown({ label: 'Row A', onDelete, onEdit, record }))

    fireEvent.click(screen.getByRole('button', { name: /actions for row a/i }))
    fireEvent.click(await screen.findByRole('menuitem', { name: /edit/i }))

    expect(onEdit).toHaveBeenCalledWith(record)
    expect(onDelete).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /actions for row a/i }))
    fireEvent.click(await screen.findByRole('menuitem', { name: /delete/i }))

    expect(onDelete).toHaveBeenCalledWith(record)
  })

  it('calls extra action handlers from menu items', async () => {
    const onClick = jest.fn()

    render(
      renderTableActionsDropdown({
        extraActions: [{ key: 'socket-stats', label: 'Socket Stats', onClick }],
        label: 'Row A',
        record,
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: /actions for row a/i }))
    fireEvent.click(await screen.findByRole('menuitem', { name: /socket stats/i }))

    expect(onClick).toHaveBeenCalledWith(record)
  })

  it('returns no control without actions', () => {
    const { container } = render(<>{renderTableActionsDropdown({ label: 'Row A', record })}</>)

    expect(container).toBeEmptyDOMElement()
  })
})
