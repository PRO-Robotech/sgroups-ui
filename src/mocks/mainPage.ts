const mainPageLeftListData = [
  {
    key: '/security-groups',
    label: 'Security Groups',
  },
  {
    key: '/networks',
    label: 'Networks',
  },
  {
    key: 'divider',
    type: 'divider',
  },
  {
    key: '/rules',
    type: 'group',
    label: 'Rules',
    children: [
      { key: '/rules-sg-sg', label: 'SG-SG' },
      { key: '/rules-sg-sg-icmp', label: 'SG-SG-ICMP' },
      { key: '/rules-cidr', label: 'CIDR' },
      { key: '/rules-cidr-icmp', label: 'CIDR-ICMP' },
      { key: '/rules-sg-sg-ie', label: 'SG-SG-IE' },
      { key: '/rules-sg-sg-ie-icmp', label: 'SG-SG-IE-ICMP' },
      { key: '/rules-fqdn', label: 'FQDN' },
    ],
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
