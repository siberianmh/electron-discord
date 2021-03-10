import { GuildMember, User } from 'discord.js'

/**
 * Returns a string for `user` which has their mention and ID.
 */
export function formatUser(user: User | GuildMember) {
  return `<@${user.id}> (\`${user.id}\`)`
}
