import { Collection, GuildChannel } from 'discord.js'
import { helpChannels } from '../../lib/config'

export const helpMessage = (
  availableChannels: Collection<string, GuildChannel>,
) => `
**⚠⚠ PLEASE READ THIS BEFORE OPENING HELP CHANNEL ⚠⚠**

Starting from Electron v12.x.y the default value of \`contextIsolation\` changed from \`false\` to \`true\`. If you problem like "I have nodeIntegration enabled but I still not able to use require", change the value of \`contextIsolation\` to \`false\`.
For more information see <https://www.electronjs.org/docs/breaking-changes> and <https://www.electronjs.org/docs/tutorial/context-isolation>.

**⚠⚠ IF YOUR PROBLEM IS NOT LISTED ABOVE, NOW OPEN HELP CHANNEL ⚠⚠**

**How to Ask For Help**

1. If your question fits into the \`Ecosystem\` or \`Frameworks\` category, post it into them.
2. If no, send a question to the ${availableChannels
  .map((channel) => `<#${channel.id}>`)
  .join(' or ')} channels in the \`❓ Help: Available\` category.
3. Our bot will move your channel to \`📝 Help: Ongoing\`
4. Somebody will (hopefully) come along and help you.

Channel is closing using the \`!close\` command, or if you don't get activity more than \`${
  helpChannels.dormantChannelTimeout
}\` hours automatically. After the channel has been closed, it will move into the \`Help: Dormant\` category at the bottom of channel list.

When you share your question, include your **current version of Electron** (e.g. 12.0.0) and **operating system** (e.g. macOS Big Sur, Windows 10 20H2).
If you can, try to reproduce the issue in Electron Fiddle: https://www.electronjs.org/fiddle. You can then export your Fiddle code to a gist; include the link to your gist in your question.

**How To Get Answers**

We're very lucky to have members who volunteer their free time to help others. However, not all questions get answered the first time they get asked. There are some things that you can do to increase your chances of getting an answer, like providing enough details and a minimal code example. If you can reproduce your issue in Electron Fiddle, even better!
`
