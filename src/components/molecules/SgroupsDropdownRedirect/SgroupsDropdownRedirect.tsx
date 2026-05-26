import { FC, useMemo } from 'react'
import { Select, Spin } from 'antd'
import jp from 'jsonpath'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { TDynamicComponentsAppTypeMap, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'

type TSgroupsDropdownRedirectData = TDynamicComponentsAppTypeMap['DropdownRedirect'] & {
  labelJsonPath?: string
}

type TResourceList = {
  items?: Record<string, unknown>[]
}

const TitleSelect = styled(Select)`
  &&.ant-select {
    cursor: pointer;

    .ant-select-selector {
      border: none;
      background: transparent;
      box-shadow: none;
      padding: 0;
      height: auto;
      cursor: pointer;
    }

    .ant-select-selection-item {
      font-size: 20px;
      line-height: 24px;
      padding-inline-end: 24px;
      cursor: pointer;
    }

    .ant-select-arrow {
      font-size: 14px;
      right: 0;
      cursor: pointer;
      color: inherit;
    }

    &:hover .ant-select-selector {
      border: none;
    }

    &.ant-select-focused .ant-select-selector {
      border: none;
      box-shadow: none;
    }
  }
`

const readJsonPath = (item: Record<string, unknown>, jsonPath: string) => {
  try {
    const value = jp.query(item, `$${jsonPath}`)?.[0]

    return value === undefined || value === null ? undefined : String(value)
  } catch {
    return undefined
  }
}

export const SgroupsDropdownRedirect: FC<{ data: TSgroupsDropdownRedirectData }> = ({ data }) => {
  const {
    apiGroup,
    apiVersion,
    cluster,
    currentValue,
    jsonPath,
    labelJsonPath,
    loading: externalLoading,
    namespace,
    placeholder = 'Select...',
    plural,
    popupMatchSelectWidth,
    redirectUrl,
    showSearch = true,
    style,
  } = data
  const navigate = useNavigate()
  const {
    data: resourceList,
    isLoading: isResourceLoading,
    isError,
  } = useK8sSmartResource<TResourceList>({
    apiGroup,
    apiVersion,
    cluster,
    isEnabled: Boolean(cluster && apiVersion && plural),
    namespace,
    plural,
  })

  const options = useMemo(() => {
    if (!resourceList?.items?.length) {
      return []
    }

    return resourceList.items
      .map(item => {
        const value = readJsonPath(item, jsonPath)

        if (!value) {
          return null
        }

        const label = labelJsonPath ? readJsonPath(item, labelJsonPath) || value : value

        return { label, value }
      })
      .filter((option): option is { label: string; value: string } => Boolean(option))
  }, [jsonPath, labelJsonPath, resourceList?.items])

  const handleChange = (selectedValue: unknown) => {
    if (typeof selectedValue !== 'string') {
      return
    }

    navigate(redirectUrl.replace(/\{chosenEntryValue\}/g, encodeURIComponent(selectedValue)))
  }

  if (isResourceLoading || externalLoading) {
    return <Spin size="small" />
  }

  if (isError) {
    return <span>Error loading resources</span>
  }

  return (
    <TitleSelect
      value={currentValue}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
      style={style}
      showSearch={showSearch}
      filterOption={(input, option) =>
        `${option?.label ?? ''} ${option?.value ?? ''}`.toLowerCase().includes(input.toLowerCase())
      }
      variant="borderless"
      popupMatchSelectWidth={popupMatchSelectWidth}
    />
  )
}
