import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<'sqlite' | 'postgres'>('DB_TYPE', 'sqlite'),
        database: configService.get<string>('DB_NAME', 'development.db'),
        entities: [User, Project],
        synchronize: true, // Disable in production
      }),
    }),
  ],
})
export class DatabaseModule {}
