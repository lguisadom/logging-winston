import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import path from 'path';

const { combine, timestamp, label, printf, splat, json, errors, prettyPrint } =
  winston.format;

const errorField = winston.format((info, opts) => {
  if (info.stack) {
    info.error = info.stack;
    delete info.stack;
  }
  return info;
});

@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: () => ({
        level: 'info',
        format: combine(
          timestamp(),
          splat(),
          errors({ stack: true }),
          errorField(),
          prettyPrint(),
        ),
        defaultMeta: {
          service: '{service-name}',
          containerInfo: {
            memoryLimitInMB: '{container size limit}',
          },
          env: process.env.ENV || 'dev',
          serviceVersion: '{service-version}',
        },
        transports: [new winston.transports.Console()],
        rejectionHandlers: [
          new winston.transports.File({ filename: 'rejections.log' }),
        ],
        exitOnError: false,
      }),
      inject: [],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
