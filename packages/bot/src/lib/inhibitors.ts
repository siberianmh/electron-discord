import type { Inhibitor } from 'lunawork'
import { guild } from './config'

export const isTrustedMember: Inhibitor = async (msg) => {
  if (!msg.guild || !msg.member || msg.channel?.type !== 'text') {
    return ":man_gesturing_no: you can't use that command here"
  }

  if (
    // @ts-ignore
    !msg.member.permissions.has('MANAGE_MESSAGES') &&
    // @ts-ignore
    !msg.member.roles.cache.has(guild.roles.maintainer)
  ) {
    return ":man_gesturing_no: you don't have permissions to use that command"
  }

  return
}

export const noDM: Inhibitor = async (msg) => {
  if (!msg.guild || !msg.member || msg.channel?.type !== 'text') {
    return ":man_gesturing_no: you can't use that command here"
  }

  return
}

export const noAuthorizedClaim: Inhibitor = async (msg) => {
  if (
    // @ts-ignore
    !msg.member?.permissions.has('MANAGE_MESSAGES') ||
    // @ts-ignore
    !msg.member.roles.cache.has(guild.roles.maintainer)
  ) {
    return `Hello <@${
      msg.member!.user.id
    }>, however, this command is can be only used by the moderation team, if you are searching for help you can read the guide at <#${
      guild.channels.askHelpChannel
    }> channel, and claim a channel from the \`Help: Available\` category.`
  }
  return
}
