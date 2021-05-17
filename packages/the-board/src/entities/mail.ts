import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity('mail')
export class Mail extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar')
  prefix: string

  @Column('varchar')
  channel_id: string

  @Column('varchar')
  user_id: string

  @CreateDateColumn()
  created_at: Date
}
