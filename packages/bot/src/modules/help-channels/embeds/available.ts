// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { MessageEmbed } from 'discord.js'
import { helpChannels, style } from '../../../lib/config'

/**
 * The embed that has been posted when the help channel is
 * became available again.
 */
export const availableEmbed = new MessageEmbed()
  .setColor(style.colors.greenBright)
  .setTitle('✅ Available help channel')
  .setDescription(
    '**Send your question here to claim the channel**\n' +
      'This channel will be dedicated to answering your question only. We will try to answer and help you solve the issue.\n\n' +
      '**Keep in mind:**\n' +
      "• It's always ok to just ask your question. You don't need permission.\n" +
      '• Explain what you expect to happen and what actually happens.\n' +
      '• Include a code sample and error message, if you got any.\n\n' +
      "Try to write the best question you can by providing a detailed description and telling us what you've tried already",
  )
  .setFooter(
    `Closes when you send /close or after ${helpChannels.dormantChannelTimeout} hours of inactivity`,
  )
