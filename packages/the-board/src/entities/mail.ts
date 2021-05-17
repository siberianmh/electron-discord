import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity('mail_channel')
export class Mail extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar')
  channel_name: string

  @Column('varchar')
  channel_id: string

  @Column('varchar')
  user_id: string

  @CreateDateColumn()
  created_at: Date
}
