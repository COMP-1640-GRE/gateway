import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attachment, AttachmentType } from './entities/attachment.entity';
import { Repository } from 'typeorm';
import { CreateAttachmentDto } from './dto/attachment.dto';
import { Contribution } from 'src/contributions/entities/contribution.entity';

const DOCUMENT_TYPES = [
  'msword',
  'vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ACCEPTED_FILE_TYPES = ['jpg', 'jpeg', 'png'].concat(DOCUMENT_TYPES);

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
  ) {}

  validate(
    userId: number,
    attachments: Array<Express.Multer.File>,
  ): CreateAttachmentDto[] {
    if (!attachments || attachments.length === 0) {
      throw new BadRequestException('Attachments are required');
    }

    return attachments.map((file) => {
      console.log(file.mimetype);

      const fileType = file.mimetype.split('/')[1];
      if (!ACCEPTED_FILE_TYPES.includes(fileType.toLowerCase())) {
        throw new BadRequestException('Invalid file type: ' + fileType);
      }
      let type = AttachmentType.IMAGE;

      if (DOCUMENT_TYPES.includes(fileType.toLowerCase())) {
        type = AttachmentType.document;
      }

      return {
        type,
        file,
        userId,
      };
    });
  }

  async creates(contribution: Contribution, dto: CreateAttachmentDto[]) {
    const uploadedAttachments = await Promise.all(dto.map(this.upload));

    return this.attachmentsRepository.save(
      uploadedAttachments.map((attachment) => ({
        ...attachment,
        contribution,
      })),
    );
  }

  async upload({ file, type, userId }: CreateAttachmentDto) {
    // TODO: call gRPC service
    return {
      path: '',
      type,
    };
  }

  async deletes(to_delete: string[]) {
    // TODO: call gRPC service
    return;
  }
}