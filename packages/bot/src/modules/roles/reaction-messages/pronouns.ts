// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { IRoleMessage } from '../../../lib/types'
import { guild } from '../../../lib/config'

export const pronousRoles: IRoleMessage = {
  name: 'pronous',
  description: 'React to this to self-assign pronoun roles:\n',
  reactions: [
    // any pronouns
    {
      name: 'any pronouns',
      autoRemove: false,
      roleId: guild.roles.anyPronouns,
      emojiId: '<:anypronouns:805243043183067147>',
      rawEmojiId: '805243043183067147',
    },
    // fae/fear
    {
      name: 'fae/fear',
      autoRemove: false,
      roleId: guild.roles.faeFaer,
      emojiId: '<:fae:805243043653484574>',
      rawEmojiId: '805243043653484574',
    },
    // he/him
    {
      name: 'he/him',
      autoRemove: false,
      roleId: guild.roles.heHim,
      emojiId: '<:he:805243043425943553>',
      rawEmojiId: '805243043425943553',
    },
    // it/its
    {
      name: 'it/its',
      autoRemove: false,
      roleId: guild.roles.itIts,
      emojiId: '<:it:805243043472867358>',
      rawEmojiId: '805243043472867358',
    },
    // no pronouns
    {
      name: 'no pronouns',
      autoRemove: false,
      roleId: guild.roles.noPronouns,
      emojiId: '<:nopronouns:805243043653222450>',
      rawEmojiId: '805243043653222450',
    },
    // she/her
    {
      name: 'she/her',
      autoRemove: false,
      roleId: guild.roles.sheHer,
      emojiId: '<:she:805243043531587585>',
      rawEmojiId: '805243043531587585',
    },
    // they/then
    {
      name: 'they/then',
      autoRemove: false,
      roleId: guild.roles.theyThem,
      emojiId: '<:they:805243043582181376>',
      rawEmojiId: '805243043582181376',
    },
    // xe/xim
    {
      name: 'xe/xim',
      autoRemove: false,
      roleId: guild.roles.xeXim,
      emojiId: '<:xe:805243043132604457>',
      rawEmojiId: '805243043132604457',
    },
    // ze/zir
    {
      name: 'ze/zir',
      autoRemove: false,
      roleId: guild.roles.zeZir,
      emojiId: '<:ze:805243043527131196>',
      rawEmojiId: '805243043527131196',
    },
  ],
}
