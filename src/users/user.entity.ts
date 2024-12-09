import { Project } from '../projects/project.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({
    type: 'text',
    enum: ['GOOGLE', 'APPLE', 'LOCAL'],
    default: 'LOCAL',
  })
  authProvider: 'GOOGLE' | 'APPLE' | 'LOCAL';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Project, (project) => project.owner)
  projects: Project[];

  @Column({ select: false, nullable: true })
  password: string;

  @Column({ nullable: true, select: false })
  refreshToken?: string;

  async validatePassword(password: string): Promise<boolean> {
    return this.password ? bcrypt.compare(password, this.password) : false;
  }
}
