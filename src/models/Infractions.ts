import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class Infractions {
  @PrimaryGeneratedColumn({
    type: 'integer',
  })
  infractionID!: number;

  @Column({
    type: 'varchar',
    length: 10,
  })
  infractionType!: string;

  @Column({
    type: 'varchar',
    length: 64,
  })
  user!: string;

  @Column({
    type: 'varchar',
    length: 64,
  })
  staffMember!: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: 'No reason provided',
  })
  reason!: string;
  @Column({
    type: 'int',
    nullable: true,
  })
  unbanDate!: number;

  perma!: boolean;
}
