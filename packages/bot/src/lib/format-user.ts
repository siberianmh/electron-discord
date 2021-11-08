// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { GuildMember, User } from 'discord.js'

/**
 * Returns a string for `user` which has their mention and ID.
 */
export function formatUser(user: User | GuildMember) {
  return `<@${user.id}> (\`${user.id}\`)`
}
