// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { IRoleMessage } from '../../../lib/types'
import { guild } from '../../../lib/config'

export const operationSystemRoles: IRoleMessage = {
  name: 'operating-system',
  description:
    ':desktop: React to this message to self-assign your host operating system:\n',
  reactions: [
    // Windows
    {
      name: 'Windows',
      autoRemove: false,
      roleId: guild.roles.windows,
      emojiId: '<:windows:813562556433170433>',
      rawEmojiId: '813562556433170433',
    },
    // macOS
    {
      name: 'macOS',
      autoRemove: false,
      roleId: guild.roles.macOS,
      emojiId: '<:mac:813562556642754661>',
      rawEmojiId: '813562556642754661',
    },
    // Linux
    {
      name: 'Linux',
      autoRemove: false,
      roleId: guild.roles.linux,
      emojiId: '<:linux:813562556802793472>',
      rawEmojiId: '813562556802793472',
    },
  ],
}
