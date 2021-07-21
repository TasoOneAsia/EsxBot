import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export default class CommandsRan {
  @PrimaryGeneratedColumn({
    type: 'integer',
  })
  id!: number;

  @Column()
  commandId!: string;

  @Column()
  primaryAlias!: string;

  @Column()
  raw!: string;

  @Column()
  commandRanBy!: string;

  @Column()
  group!: string;

  @CreateDateColumn()
  createdOn!: Date;
}
