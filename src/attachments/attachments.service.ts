import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
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
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

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

  validate(
    attachments: Array<Express.Multer.File>,
    required = true,
  ): CreateAttachmentDto[] {
    if (!required && (!attachments || attachments.length === 0)) {
      return [];
    }
    if (!attachments || attachments.length === 0) {
      throw new BadRequestException('Attachments are required');
    }

    return attachments.map((file) => {
      const fileType = file.mimetype;
      if (!fileType.toLowerCase().startsWith('image/')) {
        if (!DOCUMENT_TYPES.includes(fileType.toLowerCase())) {
          throw new BadRequestException('Invalid file type: ' + fileType);
        }
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

  async uploadAvatar(userId: number, file: Express.Multer.File) {
    const res = await lastValueFrom<any>(
      this.filesService.UploadFiles({
        files: [file.buffer],
        filenames: [file.originalname],
        filepath: `avatar/${userId}`,
      }),
    );

    const path = res?.urls?.[0];
    if (path) {
      return {
        path,
      };
    }
  }

  async deletes(to_delete: string[]) {
    try {
      if (!to_delete || to_delete.length === 0) {
        return;
      }
      const deleted = await Promise.all(
        to_delete.map(async (path) =>
          this.attachmentsRepository.delete({ path }),
        ),
      );

      await Promise.all(
        to_delete.map(async (url) => this.filesService.DeleteFile({ url })),
      );

      return deleted;
    } catch (error) {
      console.warn(error);
    }
  }

  async download(filename: string, urls: string[]) {
    if (!urls || urls.length === 0) {
      throw new NotFoundException('Attachments not found');
    }

    return this.filesService.DownloadMultipleFileAsZip({
      filename,
      urls,
    });
  }
}
