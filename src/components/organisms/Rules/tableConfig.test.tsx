import fs from 'fs'
import path from 'path'
import { buildRulesColumns } from './tableConfig'

describe('Rules table config', () => {
  it('keeps transport summary columns commented out of the active table', () => {
    const columnTitles = buildRulesColumns().map(column => column.title)

    expect(columnTitles).not.toContain('Protocol')
    expect(columnTitles).not.toContain('IP Family')
    expect(columnTitles).not.toContain('Ports / Types')
  })

  it('keeps the inactive transport summary column definitions in comments', () => {
    const source = fs.readFileSync(path.join(__dirname, 'tableConfig.ts'), 'utf8')

    expect(source).toContain("//   title: 'Protocol',")
    expect(source).toContain("//   title: 'IP Family',")
    expect(source).toContain("//   title: 'Ports / Types',")
  })
})
