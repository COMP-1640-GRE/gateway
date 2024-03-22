import { AttachmentType } from '../entities/attachment.entity';

export class CreateAttachmentDto {
  type: AttachmentType;
  file: Express.Multer.File;
}
