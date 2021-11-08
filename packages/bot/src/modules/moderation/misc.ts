// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { LunaworkClient, listener } from '@siberianmh/lunawork'
import { ThreadChannel } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'

/**
 * A some moderation stuff which is currently doesn't find
 * the right place to store.
 */
export class MiscStuffStage extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  /**
   * Join to the threads 👀
   */
  @listener({ event: 'threadCreate' })
  public async onThreadCreate(thread: ThreadChannel) {
    console.log(`joining to the thread ${thread.name} (${thread.id})`)
    return thread.join()
  }
}
