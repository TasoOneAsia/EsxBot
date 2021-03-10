import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export default class Infractions {
  @PrimaryGeneratedColumn({
    type: 'integer',
  })
  infractionID!: number;

  @Column({
    type: 'varchar',
    length: 64,
  })
  guildId!: string;

  @Column({
    type: 'varchar',
    length: 10,
  })
  infractionType!: string;

  @Column({
    nullable: false,
  })
  user!: string;

  @Column({
    nullable: false,
  })
  staffMember!: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: 'No reason provided',
  })
  reason!: string;

  @Column()
  unbanDate!: number;

  @CreateDateColumn()
  createdDate!: Date;

  @UpdateDateColumn()
  updatedDate!: Date;
}
