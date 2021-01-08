import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export default class GuildSettings {
  @PrimaryColumn({
    type: 'varchar',
    length: 3,
    default: '!',
    nullable: false,
  })
  prefix!: string;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  logChannel!: string;
}
