import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import { TenantSelector } from './TenantSelector'

const mockNavigate = jest.fn()
const mockUseK8sSmartResource = jest.fn()

let mockSearch = ''
let mockParams: { cluster?: string; namespace?: string } = {}

jest.mock(
  '@prorobotech/openapi-k8s-toolkit',
  () => ({
    useK8sSmartResource: (...args: unknown[]) => mockUseK8sSmartResource(...args),
  }),
  { virtual: true },
)

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ search: mockSearch }),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}))

jest.mock('antd', () => {
  const ReactActual = jest.requireActual<typeof React>('react')

  return {
    Alert: ({ message }: { message: React.ReactNode }) => <div role="alert">{message}</div>,
    Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Select: ({
      disabled,
      loading,
      onChange,
      options,
      placeholder,
      value,
    }: {
      disabled?: boolean
      loading?: boolean
      onChange: (value: string) => void
      options: Array<{ label: string; value: string }>
      placeholder?: string
      value?: string
    }) => (
      <select
        aria-label={placeholder}
        data-loading={loading ? 'true' : 'false'}
        disabled={disabled}
        onChange={event => onChange(event.target.value)}
        value={value}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),
    Typography: {
      Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    },
    __esModule: true,
    default: ReactActual,
  }
})

describe('TenantSelector', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockUseK8sSmartResource.mockReturnValue({
      data: {
        items: [{ metadata: { name: 'tenant-a' } }, { metadata: { name: 'tenant-b' } }],
      },
      error: undefined,
      isLoading: false,
    })
    mockSearch = ''
    mockParams = { cluster: 'cluster-a' }
    window.history.replaceState(null, '', '/clusters/cluster-a/resources')
  })

  it('loads tenant options for the selected cluster and sorts tenant names', () => {
    mockUseK8sSmartResource.mockReturnValue({
      data: {
        items: [{ metadata: { name: 'zeta' } }, { metadata: { name: undefined } }, { metadata: { name: 'alpha' } }],
      },
      error: undefined,
      isLoading: true,
    })

    render(<TenantSelector cluster="cluster-a" tenant="zeta" />)

    expect(mockUseK8sSmartResource).toHaveBeenCalledWith({
      apiGroup: 'sgroups.io',
      apiVersion: 'v1alpha1',
      cluster: 'cluster-a',
      isEnabled: true,
      plural: 'tenants',
    })
    expect(screen.getByLabelText('Tenant')).toHaveAttribute('data-loading', 'true')
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['All Tenants', 'alpha', 'zeta'])
  })

  it('inserts the selected tenant after the cluster segment and preserves search params', () => {
    mockSearch = '?tab=rules'
    window.history.replaceState(null, '', '/clusters/cluster-a/resources?tab=rules')

    render(<TenantSelector cluster="cluster-a" />)

    fireEvent.change(screen.getByLabelText('Tenant'), { target: { value: 'tenant-a' } })

    expect(mockNavigate).toHaveBeenCalledWith('/clusters/cluster-a/tenant-a/resources?tab=rules')
  })

  it('replaces an existing tenant namespace when another tenant is selected', () => {
    mockParams = { cluster: 'cluster-a', namespace: 'tenant-a' }
    window.history.replaceState(null, '', '/clusters/cluster-a/tenant-a/resources')

    render(<TenantSelector cluster="cluster-a" tenant="tenant-a" />)

    fireEvent.change(screen.getByLabelText('Tenant'), { target: { value: 'tenant-b' } })

    expect(mockNavigate).toHaveBeenCalledWith('/clusters/cluster-a/tenant-b/resources')
  })

  it('removes the tenant namespace when All Tenants is selected', () => {
    mockParams = { cluster: 'cluster-a', namespace: 'tenant-a' }
    window.history.replaceState(null, '', '/clusters/cluster-a/tenant-a/resources')

    render(<TenantSelector cluster="cluster-a" tenant="tenant-a" />)

    fireEvent.change(screen.getByLabelText('Tenant'), { target: { value: '__all_tenants__' } })

    expect(mockNavigate).toHaveBeenCalledWith('/clusters/cluster-a/resources')
  })

  it('disables tenant selection and skips loading when there is no cluster', () => {
    mockParams = {}

    render(<TenantSelector />)

    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({
        cluster: '',
        isEnabled: false,
      }),
    )
    expect(screen.getByLabelText('Tenant')).toBeDisabled()
  })

  it('shows a loading error message', () => {
    mockUseK8sSmartResource.mockReturnValue({
      data: undefined,
      error: new Error('boom'),
      isLoading: false,
    })

    render(<TenantSelector cluster="cluster-a" />)

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load tenants: Error: boom')
  })
})
