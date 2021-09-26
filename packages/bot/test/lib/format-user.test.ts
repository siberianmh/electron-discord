import { formatUser } from '../../src/lib/format-user'

describe('formatUser', () => {
  test('do user formation', () => {
    const user = {
      id: '1345678900',
    }
    const result = formatUser(user as any)
    expect(result).toEqual('<@1345678900> (`1345678900`)')
  })
})
