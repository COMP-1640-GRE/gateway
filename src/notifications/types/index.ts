export type TemplateCode =
  | 'std01_email'
  | 'std01_noti'
  | 'std02_email'
  | 'std02_noti'
  | 'std03_email'
  | 'std03_noti'
  | 'fac01_email'
  | 'fac01_noti'
  | 'reset_pw_email';

export type NotifyType = {
  userId: number;
  templateCode: TemplateCode;
  sendMail?: boolean;
  option?: string;
};
