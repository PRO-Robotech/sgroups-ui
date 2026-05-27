/* eslint-disable import/first */
import React from 'react'
import { render, screen } from '@testing-library/react'

const mockUseK8sSmartResource = jest.fn()
const mockNavigate = jest.fn()

jest.mock(
  '@prorobotech/openapi-k8s-toolkit',
  () => ({
    useK8sSmartResource: (...args: unknown[]) => mockUseK8sSmartResource(...args),
  }),
  { virtual: true },
)

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

import { SgroupsDropdownRedirect } from './SgroupsDropdownRedirect'

describe('SgroupsDropdownRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockReturnValue({
      data: {
        items: [
          {
            metadata: { name: 'ag-admin' },
            spec: { displayName: 'Admin Segment' },
          },
          {
            metadata: { name: 'ag-web' },
            spec: { displayName: 'Web Segment' },
          },
        ],
      },
      isError: false,
      isLoading: false,
    })
  })

  it('uses metadata.name as value and displayName as the visible selected label', () => {
    render(
      <SgroupsDropdownRedirect
        data={{
          apiGroup: 'sgroups.io',
          apiVersion: 'v1alpha1',
          cluster: 'cluster-a',
          currentValue: 'ag-admin',
          id: 'resource-name-dropdown',
          jsonPath: '.metadata.name',
          labelJsonPath: '.spec.displayName',
          namespace: 'tenant-a',
          plural: 'addressgroups',
          redirectUrl: '/addressgroups/tenant-a/{chosenEntryValue}',
        }}
      />,
    )

    expect(screen.getByText('Admin Segment')).toBeInTheDocument()
    expect(screen.queryByText('ag-admin')).not.toBeInTheDocument()
  })
})
