import { MessageEmbed } from 'discord.js'
import { style, helpChannels } from '../../../lib/config'

export const claimedEmbed = (claimedBy: string) =>
  new MessageEmbed()
    .setColor(style.colors.yellow)
    .setTitle('🔐 Claimed help channel')
    .setDescription(
      `This help channels is claimed by <@${claimedBy}>. You can claim own channel under the \`Help: Available\` category.`,
    )
    .setFooter(
      `Closes when you send !close or after ${helpChannels.dormantChannelTimeout} hours of inactivity`,
    )
