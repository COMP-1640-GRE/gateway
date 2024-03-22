import { AttachmentType } from '../entities/attachment.entity';

export class CreateAttachmentDto {
  userId: number;
  type: AttachmentType;
  file: Express.Multer.File;
}
