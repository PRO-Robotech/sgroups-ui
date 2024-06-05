const mainPageLeftListData = [
  {
    key: '/networks',
    label: 'Networks',
  },
  {
    key: '/security-groups',
    label: 'Security Groups',
  },
  {
    key: 'divider-1',
    type: 'divider',
  },
  {
    key: '/rules',
    label: 'Rules',
    children: [
      { key: '/rules-editor/by-type/sgSg', label: 'sg-sg' },
      { key: '/rules-editor/by-type/sgSgIcmp', label: 'sg-sg-icmp' },
      { key: '/rules-editor/by-type/sgSgIe', label: 'sg-sg-ie' },
      { key: '/rules-editor/by-type/sgSgIeIcmp', label: 'sg-sg-ie-icmp' },
      { key: '/rules-editor/by-type/sgFqdn', label: 'sg-fqdn' },
      { key: '/rules-editor/by-type/sgCidr', label: 'sg-cidr-ie' },
      { key: '/rules-editor/by-type/sgCidrIcmp', label: 'sg-cidr-ie-icmp' },
    ],
  },
  {
    key: 'divider-2',
    type: 'divider',
  },
  {
    key: '/rules-editor',
    label: 'Rules Editor',
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
