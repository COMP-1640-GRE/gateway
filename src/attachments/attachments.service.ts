import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Contribution } from 'src/contributions/entities/contribution.entity';
import { Repository } from 'typeorm';
import { CreateAttachmentDto } from './dto/attachment.dto';
import { Attachment, AttachmentType } from './entities/attachment.entity';

const DOCUMENT_TYPES = [
  'msword',
  'vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ACCEPTED_FILE_TYPES = ['jpg', 'jpeg', 'png'].concat(DOCUMENT_TYPES);

@Injectable()
export class AttachmentsService implements OnModuleInit {
  private filesService: any;

  constructor(
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
    @Inject('FILE_TRANSFER_PACKAGE') private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.filesService = this.client.getService('FileTransfer');
  }

  validate(attachments: Array<Express.Multer.File>): CreateAttachmentDto[] {
    if (!attachments || attachments.length === 0) {
      throw new BadRequestException('Attachments are required');
    }

    return attachments.map((file) => {
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
      };
    });
  }

  async creates(contribution: Contribution, dto: CreateAttachmentDto[]) {
    const uploadedAttachments = await Promise.all(
      dto.map(({ file, type }) =>
        this.upload({ file, type, contributionId: contribution.id }),
      ),
    );

    return this.attachmentsRepository.save(
      uploadedAttachments.map((attachment) => ({
        ...attachment,
        contribution,
      })),
    );
  }

  async upload({
    file,
    type,
    contributionId,
  }: CreateAttachmentDto & { contributionId: number }) {
    const res = await lastValueFrom<any>(
      this.filesService.UploadFiles({
        files: [file.buffer],
        filenames: [file.originalname],
        filepath: `attachments/${contributionId}`,
      }),
    );

    const path = res?.urls?.[0];
    if (path) {
      return {
        path,
        type,
      };
    }
  }

  async deletes(to_delete: string[]) {
    try {
      return Promise.all(
        to_delete.map(async (url) => this.filesService.DeleteFile({ url })),
      );
    } catch (error) {
      console.warn(error);
    }
  }
}
