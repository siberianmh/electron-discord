import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('help_channel')
export class HelpChannel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', { unique: true })
  user_id: string

  @Column('varchar')
  channel_id: string

  @Column('varchar')
  message_id: string

  @CreateDateColumn()
  created_at: Date
}
