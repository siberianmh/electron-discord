import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { InfractionType } from '../lib/types'

@Entity('infractions')
export class Infractions extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar')
  user_id: string

  @Column('varchar', { nullable: true })
  actor_id: string

  @Column('varchar', { nullable: true })
  active: boolean

  @Column('varchar', { nullable: false })
  reason: string

  @Column('int')
  type: InfractionType

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @Column({ type: 'bigint', nullable: true })
  expires_at: Date
}
