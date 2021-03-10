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

  @ManyToOne(() => MessageRoles, (msgRole) => msgRole.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    primary: true,
  })
  message_role: MessageRoles
}
