import { MessageEmbed } from 'discord.js'

export const rulesText = () =>
  new MessageEmbed()
    .setTitle('Electron Discord Rules')
    .setDescription(
      'We have a small set of rules on our server, please read them.',
    )
    .addField(
      'Rule 1',
      'Follow the [Discord Community Guidelines](https://discord.com/guidelines) and [Terms Of Services](https://discord.com/terms).',
    )
    .addField(
      'Rule 2',
      'Follow the [Electron OpenJS Foundation Code Of Conduct](https://github.com/electron/electron/blob/master/CODE_OF_CONDUCT.md).',
    )
    .addField(
      'Rule 3',
      'Absolutely no hate speech, derogatory language, or abuse of any kind. We have a zero tolerance policy for disrespect towards any individual.',
    )
    .addField(
      'Rule 4',
      "Please be kind! We understand times are tough, but it's no reason to take it out on others. Please keep the Electron Discord a positive, safe space, and treat other community members with respect.",
    )
    .addField(
      'Rule 5 (Not Applicable)',
      "Have a problem? Ask an Admin! Please DM if you ever have issues with other community members, parts of the Discord, or specific questions. We're here to help!",
    )
