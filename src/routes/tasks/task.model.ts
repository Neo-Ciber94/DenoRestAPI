import { Auditable } from "../../types/auditable.ts";
import { Entity } from "../../types/entity.ts";

export interface Task extends Entity<string>, Auditable {
  title: string;
  completed: boolean;
  tags: string[];
}
