import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const LoggerModuleConfig = LoggerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const devMode = configService.get<boolean>('devMode');
    if (devMode) {
      return {
        pinoHttp: {
          level: 'debug',
          transport: {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              colorize: true,
              colorizeObjects: true,
              errorLikeObjectKeys: ['e', 'err', 'error', 'cause'],
            },
          },
        },
      };
    }
    return {
      pinoHttp: {
        level: 'info',
      },
    };
  },
});
