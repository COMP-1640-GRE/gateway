import { Contribution } from 'src/contributions/entities/contribution.entity';
import { BaseEntity } from 'src/utils/entity/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';

export const ATTACHMENT_ENTITY = 'attachment';

export enum AttachmentType {
  IMAGE = 'image',
  document = 'document',
}

@Entity({ name: ATTACHMENT_ENTITY })
export class Attachment extends BaseEntity {
  @Column()
  path: string;

  @Column({
    type: 'enum',
    enum: AttachmentType,
  })
  type: AttachmentType;

  @ManyToOne(() => Contribution, (contribution) => contribution.attachments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  contribution: Contribution;
}
