// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('message_roles')
export class MessageRoles extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar')
  name: string

  @Column('varchar')
  message_id: string
}

@Entity('message_roles_actions')
export class MessageRolesActions extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar')
  role_id: string

  @Column('varchar')
  emoji_id: string

  @Column('boolean', { default: false })
  auto_remove: boolean

  @ManyToOne(() => MessageRoles, (msgRole) => msgRole.id)
  message_role: MessageRoles
}
