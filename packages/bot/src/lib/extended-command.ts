import { command, Stage, IPrefixCommandDecoratorOptions } from 'lunawork'
import { Message, MessageEmbed } from 'discord.js'
import { ModLogModule } from '../modules/moderation/modlog'
import { style } from './config'
import * as Sentry from '@sentry/node'

export function extendedCommand(
  opts: Partial<IPrefixCommandDecoratorOptions> | undefined = {},
) {
  return function (
    target: Stage,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const modLogModule = new ModLogModule(target.client)

    const onError = (msg: Message, error: Error) => {
      const eventID = Sentry.captureException(error)

      const embed = new MessageEmbed()
        .setTitle('Oh no!')
        .setColor(style.colors.softRed)
        .setDescription('Error while executing command!')
        .setFooter(`Sentry ID: ${eventID}`)
        .setTimestamp()

      try {
        modLogModule.sendLogMessage({
          title: `Sentry ID: ${eventID}`,
          colour: style.colors.softRed,
          text: `\`\`\`${error}\`\`\``,
        })
      } catch (e) {
        console.log(`Unable to send modlog message: ${e}`)
      }

      return msg.channel.send({ embeds: [embed] })
    }

    return command({
      onError: onError,
      ...opts,
    })(target, propertyKey, descriptor)
  }
}
