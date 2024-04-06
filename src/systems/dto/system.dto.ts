import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsPositive } from 'class-validator';

export class SystemDto {
  notifications: NotificationsConfig;

  attachments: AttachmentsConfig;
}

export class NotificationsConfig {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty()
  @IsBoolean()
  send_mail: boolean;
}
export class AttachmentsConfig {
  @ApiProperty()
  @IsPositive()
  max_size: number;
}
