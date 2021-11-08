// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { MessageEmbed } from 'discord.js'

export const voiceRulesText = () =>
  new MessageEmbed()
    .setTitle('Voice Channels Rules')
    .setDescription('We do not have any strong rules for the voice channels.')
    .addField(
      'Rule 1',
      'You can use voice channels for off-topic discussion, playing games, discussing/showing/presenting your apps, and as an advanced disccusion about your question in the help channels.',
    )
    .addField('Rule 2', 'Be tolerant and kind to peoples with that you talk')
    .addField(
      'Rule 3',
      'Do not violation of Discord [Terms of Services](https://discord.com/terms)',
    )
