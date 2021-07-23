import { MessageEmbed } from 'discord.js'
import { style } from '../../../lib/config'

export const closedSuccessfullyEmbed = new MessageEmbed()
  .setColor(style.colors.electronBlue)
  .setTitle('☑️ Question resolved')
  .setDescription(
    'The question in this help channel is successfully resolved, and this channel is no longer available, if have different questions you can pick another channel under the **❓ Help: Available** category.',
  )
