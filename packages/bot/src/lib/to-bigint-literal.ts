import type { Snowflake } from 'discord.js'

export const toBigIntLiteral = (
  value: string | number | bigint | boolean,
): Snowflake /** `${bigint}` */ => {
  return `${BigInt(value)}`
}
