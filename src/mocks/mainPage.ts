export const mainPageLeftList = [
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
      { key: '/rules-fqdn', label: 'FQDN' },
      { key: '/rules-cidr', label: 'CIDR' },
      { key: '/rules-sg-sg-icmp', label: 'SG-SG-ICMP' },
      { key: '/rules-sg-sg-ie', label: 'SG-SG-IE' },
      { key: '/rules-sg-sg-ie-icmp', label: 'SG-SG-IE-ICMP' },
    ],
  },
  {
    key: 'divider',
    type: 'divider',
  },
  {
    key: '/graph',
    label: 'Graph',
  },
]
