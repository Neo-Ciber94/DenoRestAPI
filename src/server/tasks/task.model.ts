import { FullAuditable } from "../../types/auditable.ts";
import { Entity } from "../../types/entity.ts";

export interface Task extends Entity<string>, FullAuditable {
  title: string;
  completed: boolean;
  tags: string[];
}
