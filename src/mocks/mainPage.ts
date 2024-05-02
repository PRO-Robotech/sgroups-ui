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
    key: '/rules',
    label: 'Rules',
    children: [
      { key: '/rules/sg-sg', label: 'SG-SG' },
      { key: '/rules/fqdn', label: 'FQDN' },
    ],
  },
  {
    key: '/graph',
    label: 'Graph',
  },
]
