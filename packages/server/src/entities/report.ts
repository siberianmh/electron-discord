// Copyright (c) 2021 Siberian, Inc. All rights reserved.

import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm'

@Entity()
export class Report extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar')
  user_id: string

  @Column('varchar')
  message_id: string

  @Column('varchar')
  thread_id: string

  @Column('int')
  count: number

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
