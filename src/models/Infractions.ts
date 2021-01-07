import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class Infractions {
  @PrimaryGeneratedColumn()
  infractionID!: number;

  @Column()
  infractionType!: 'ban' | 'kick' | 'warn';

  @Column()
  user!: string;

  @Column()
  staffMember!: string;

  @Column()
  reason!: string;
}
