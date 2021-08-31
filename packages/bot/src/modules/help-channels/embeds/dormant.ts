import { MessageEmbed } from 'discord.js'
import { style } from '../../../lib/config'

export const dormantEmbed = new MessageEmbed()
  .setColor(style.colors.red)
  .setTitle('❌ Dormant help channel')
  .setDescription(
    'This help channel has been marked as **dormant** due by closing. ' +
      'It is no longer possible to send messages to this channel until ' +
      'it becomes available again.\n\n' +
      'If your question does not answer yet, you can ask them in another help ' +
      'channel from the **❓ Help: Open** category by simply asking again.\n\n' +
      'Consider rephrasing your question to maximize the chance of getting a good answer.',
  )
