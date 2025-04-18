import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  // Unique,
} from 'typeorm';

@Entity()
export class Register {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column('varchar')
  name: string;

  @Column('varchar')
  email: string;

  @Column('varchar')
  otp: string;

  @Column()
  expire_at: Date;

  @UpdateDateColumn()
  readonly updated_at?: Date;

  @CreateDateColumn()
  readonly created_at?: Date;
}
