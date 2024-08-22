import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Hash {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  hash: string;

  @Column({ default: false })
  isUsed: boolean;
}