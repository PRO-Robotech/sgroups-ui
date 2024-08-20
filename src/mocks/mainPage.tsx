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
      { key: '/rules/sgSg', label: 'SG-SG' },
      { key: '/rules/sgSgIe', label: 'SG-SG (I/E)' },
      { key: '/rules/sgCidr', label: 'SG-CIDR (I/E)' },
      { key: '/rules/sgFqdn', label: 'SG-FQDN (E)' },
      { key: '/rules/diagram', label: 'Diagram' },
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
