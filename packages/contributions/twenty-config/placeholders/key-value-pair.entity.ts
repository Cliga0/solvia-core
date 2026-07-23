/**
 * Placeholder for Twenty's KeyValuePairEntity (TypeORM entity).
 * Minimal class matching the shape used by ConfigStorageService.
 * TODO: Replace with Solvia's own key-value-pair entity/table.
 */
export class KeyValuePairEntity {
  id: string;
  key: string;
  value: string | null;
  userId: string | null;
  workspaceId: string | null;
  user: unknown;
  workspace: unknown;
  textValueDeprecated: string | null;
  type: KeyValuePairType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Placeholder for Twenty's KeyValuePairType enum.
 * TODO: Replace with Solvia's own key-value-pair types.
 */
export enum KeyValuePairType {
  CONFIG_VARIABLE = 'CONFIG_VARIABLE',
}
