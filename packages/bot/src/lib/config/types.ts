import { ColorResolvable } from 'discord.js'

export interface IStyle {
  readonly colors: Record<string, ColorResolvable>
  readonly emojis: Record<string, string>
  readonly icons: Record<string, string>
}
