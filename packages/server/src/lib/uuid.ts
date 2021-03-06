import { randomUUID } from 'crypto'

const REGEX =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i

export const v4 = () => randomUUID()
export const validateUUID = (uuid: string) =>
  typeof uuid === 'string' && REGEX.test(uuid)
