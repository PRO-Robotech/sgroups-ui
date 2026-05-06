import type { TreeDataNode } from 'antd'
import { renderNamespaceBadgeWithValue } from './tableFormatters'

type TNamespacedTreeNode = {
  namespace?: string
  node: TreeDataNode
}

const DEFAULT_NAMESPACE = 'all'

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
