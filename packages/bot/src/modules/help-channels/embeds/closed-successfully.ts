import { MessageEmbed } from 'discord.js'
import { style } from '../../../lib/config'

/**
 * The embed message that is posted when help channel
 * is closed using "Close" button or using the "/close"
 * command, otherwise post {@link dormantEmbed}
 */
export const closedSuccessfullyEmbed = new MessageEmbed()
  .setColor(style.colors.electronBlue)
  .setTitle('☑️ Question resolved')
  .setDescription(
    'The question in this help channel is successfully resolved, and this channel is no longer available, if have different questions you can pick another channel under the **❓ Help: Open** category.',
  )
