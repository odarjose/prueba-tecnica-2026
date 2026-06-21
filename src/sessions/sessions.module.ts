import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './session.entity';
import { SessionsService } from './sessions.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Session])],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
