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
    nullable: false,
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
