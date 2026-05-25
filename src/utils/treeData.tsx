import type { TreeDataNode } from 'antd'
import React from 'react'
import { renderNamespaceBadgeWithValue } from './tableFormatters'

type TNamespacedTreeNode = {
  namespace?: string
  node: TreeDataNode
}

const DEFAULT_NAMESPACE = 'all'

export const renderTreeChangeHighlight = (title: React.ReactNode, label = 'Changed') =>
  React.createElement(
    'span',
    {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        maxWidth: '100%',
        padding: '3px 8px',
        margin: '-3px -8px',
        border: '1px solid rgba(20, 120, 72, 0.55)',
        borderRadius: 6,
        background: 'rgba(20, 120, 72, 0.18)',
        boxShadow: 'inset 4px 0 0 #147848',
        color: '#0f5132',
        fontWeight: 700,
      },
    },
    React.createElement('span', { style: { minWidth: 0 } }, title),
    React.createElement(
      'span',
      {
        style: {
          flexShrink: 0,
          padding: '0 6px',
          borderRadius: 10,
          background: '#147848',
          color: '#fff',
          fontSize: 10,
          fontWeight: 700,
          lineHeight: '16px',
          textTransform: 'uppercase',
        },
      },
      label,
    ),
  )

export const groupTreeDataByNamespace = (nodes: TNamespacedTreeNode[], keyPrefix: string): TreeDataNode[] => {
  const groupedNodes = nodes.reduce<Record<string, TreeDataNode[]>>((acc, item) => {
    const namespace = item.namespace || DEFAULT_NAMESPACE

    if (!acc[namespace]) {
      acc[namespace] = []
    }

    acc[namespace].push(item.node)

    return acc
  }, {})

  return Object.entries(groupedNodes).map(([namespace, children]) => ({
    title: renderNamespaceBadgeWithValue(namespace),
    key: `${keyPrefix}-namespace-${namespace}`,
    children,
  }))
}
