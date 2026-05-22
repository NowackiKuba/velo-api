export const PERMISSIONS = [
  '*',
  'PROJECT:READ',
  'PROJECT:WRITE',
  'MEMBERS:READ',
  'MEMBERS:WRITE',
  'WEBHOOKS:READ',
  'WEBHOOKS:WRITE',
  'API_KEYS:READ',
  'API_KEYS:WRITE',
  'EVENTS:READ',
  'EVENTS:WRITE',
  'LOGS:READ',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const PERMISSION_SET = new Set<string>(PERMISSIONS);

export class ProjectMemberPermissions {
  private constructor(private readonly _value: readonly Permission[]) {}

  static create(permissions: string[]) {
    if (!permissions?.length) {
      throw new Error('Project member permissions cannot be empty');
    }

    const invalid = permissions.filter((permission) => !PERMISSION_SET.has(permission));

    if (invalid.length) {
      throw new Error(`Invalid permissions: ${invalid.join(', ')}`);
    }

    return new ProjectMemberPermissions(permissions as Permission[]);
  }

  static all() {
    return new ProjectMemberPermissions(['*']);
  }

  has(permission: Permission): boolean {
    if (this._value.includes('*')) {
      return true;
    }

    return this._value.includes(permission);
  }

  get value(): readonly Permission[] {
    return this._value;
  }
}
