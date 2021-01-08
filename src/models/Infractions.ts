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
    nullable: false,
  })
  infractionType!: string;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  user!: string;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  staffMember!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    default: 'No reason provided',
  })
  reason!: string;
}
