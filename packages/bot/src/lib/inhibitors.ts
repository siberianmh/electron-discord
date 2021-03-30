import type { Inhibitor } from 'cookiecord'
import { guild } from './config'

export const isTrustedMember: Inhibitor = async (msg) => {
  if (!msg.guild || !msg.member || msg.channel.type !== 'text') {
    return ":man_gesturing_no: you can't use that command here"
  }

  if (
    !msg.member.hasPermission('MANAGE_MESSAGES') &&
    !msg.member.roles.cache.has(guild.roles.maintainer)
  ) {
    return ":man_gesturing_no: you don't have permissions to use that command"
  }

  return
}

export const noDM: Inhibitor = async (msg) => {
  if (!msg.guild || !msg.member || msg.channel.type !== 'text') {
    return ":man_gesturing_no: you can't use that command here"
  }

  return
}
