export enum Permission {
  View = "view",
  Create = "create",
  Edit = "edit",
  Delete = "delete",
}

export function getAllPermissions(): Permission[] {
  return Object.values(Permission);
}
