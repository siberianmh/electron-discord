// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { InfractionType } from './infractions'

export interface IHelpChannel {
  readonly id: number
  readonly user_id: string
  readonly channel_id: string
  readonly message_id: string
  readonly created_at: Date
}

export type IGetHelpChanByUserIdResponse = IHelpChannel
export type IGetHelpChanByChannelIdResponse = IHelpChannel
export type IListHelpChannelsRespone = Array<IHelpChannel>

export interface IMessageRoles {
  readonly id: number
  readonly name: string
  readonly message_id: string
}

export type IGetMessageRoleResponse = IMessageRoles
export type ICreateMessageRoleResponse = IMessageRoles

export interface IMessageRolesActions {
  readonly id: number
  readonly role_id: string
  readonly emoji_id: string
  readonly auto_remove: boolean
  readonly message_role: IMessageRoles
}

export type IGetMessageRolesActionsResponse = Array<IMessageRolesActions>

export interface IInfraction {
  readonly user_id: string
  readonly actor_id: string
  readonly reason: string
  readonly type: InfractionType
  readonly active?: boolean
  readonly expires_at?: Date
}
