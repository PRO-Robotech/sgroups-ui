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
    key: 'divider',
    type: 'divider',
  },
  {
    key: '/rules',
    label: 'Rules',
    children: [
      { key: '/rules-sg-sg', label: 'sg-sg' },
      { key: '/rules-sg-sg-icmp', label: 'sg-sg-icmp' },
      { key: '/rules-sg-sg-ie', label: 'sg-sg-ie' },
      { key: '/rules-sg-sg-ie-icmp', label: 'sg-sg-ie-icmp' },
      { key: '/rules-sg-fqdn', label: 'sg-fqdn' },
      { key: '/rules-sg-cidr', label: 'sg-cidr-ie' },
      { key: '/rules-sg-cidr-icmp', label: 'sg-cidr-ie-icmp' },
    ],
  },
  {
    key: 'divider',
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
          key: 'divider',
          type: 'divider',
        },
        {
          key: '/graph',
          label: 'Graph',
        },
      ]
    : [...mainPageLeftListData]
