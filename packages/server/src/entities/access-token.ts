// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('access-token')
export class AccessToken extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', { nullable: false })
  name: string

  @Column('varchar', { nullable: false })
  token: string

  @Column('varchar', { nullable: false })
  user_id: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
