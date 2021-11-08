// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

export interface IReaction {
  readonly name: string
  readonly roleId: string
  readonly emojiId: string
  readonly rawEmojiId: string
  readonly autoRemove: boolean
}

export interface IRoleMessage {
  name: string
  description: string
  reactions: Array<IReaction>
}
