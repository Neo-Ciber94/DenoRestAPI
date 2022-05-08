export interface Auditable {
  creationDate: Date;
  lastUpdateDate?: Date;
}

export interface FullAuditable extends Auditable {
  createdByUser: string;
  lastUpdatedByUser?: string;
}
