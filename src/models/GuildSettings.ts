import { Entity, Column, PrimaryColumn } from 'typeorm';
import { GuildSettingsJSON } from '../types';

@Entity()
export default class GuildSettings {
  @PrimaryColumn({
    type: 'varchar',
  })
  config_set!: string;

  @Column({
    type: 'jsonb',
    default: (): string => "'{}'",
  })
  settings!: GuildSettingsJSON;
}
