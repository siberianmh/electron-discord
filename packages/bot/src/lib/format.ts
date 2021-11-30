// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { User, GuildMember } from 'discord.js'

export function formatTimestamp(date: Date | null): string {
  if (!date) {
    return '?'
  }

  return `<t:${Math.floor(date.getTime() / 1000)}:R>`
}

/**
 * Returns a string for `user` which has their mention and ID.
 */
export function formatUser(user: User | GuildMember) {
  return `<@${user.id}> (\`${user.id}\`)`
}
