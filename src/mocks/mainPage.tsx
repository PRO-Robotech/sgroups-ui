import { Globe, Cards, TreeStructure } from '@phosphor-icons/react'

const mainPageLeftListData = [
  {
    icon: <Globe size={24} />,
    key: '/networks',
    label: 'Networks',
  },
  {
    icon: <Cards size={24} />,
    key: '/security-groups',
    label: 'Security Groups',
  },
  {
    icon: <TreeStructure size={24} />,
    key: '/rules',
    label: 'Rules',
    children: [
      { key: '/rules-editor/by-type/sgSg', label: 'SG-SG' },
      { key: '/rules-editor/by-type/sgSgIe', label: 'SG-SG (I/E)' },
      { key: '/rules-editor/by-type/sgCidr', label: 'SG-CIDR-(I/E)' },
      { key: '/rules-editor/by-type/sgFqdn', label: 'SG-FQDN (E)' },
      { key: '/rules-editor', label: 'Diagram' },
    ],
  },
]

export const mainPageLeftList =
  process.env.GRAPH_ENABLED === 'true'
    ? [
        ...mainPageLeftListData,
        {
          key: 'divider-3',
          type: 'divider',
        },
        {
          key: '/graph',
          label: 'Graph',
        },
      ]
    : [...mainPageLeftListData]
