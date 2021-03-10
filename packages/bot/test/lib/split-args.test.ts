import { splittyArgs } from '../../src/lib/split-args'

describe('splittyArgs', () => {
  test('do args splitting', () => {
    const result = splittyArgs('10h here some very funny reason')
    expect(result).toEqual(['10h', 'here', 'some', 'very', 'funny', 'reason'])
  })
})
