import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SystemDto {
  notifications: NotificationsConfig;
}

export class NotificationsConfig {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty()
  @IsBoolean()
  send_mail: boolean;
}
