// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

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
