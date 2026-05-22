export type ProjectMemberStatusType = 'PENDING' | 'ACTIVE' | 'INACTIVE';

export const VALID_TYPES: ProjectMemberStatusType[] = ['PENDING', 'ACTIVE', 'INACTIVE'];

export class ProjectMemberStatus {
  private constructor(private readonly _value: ProjectMemberStatusType) {}

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error(`Project Member Status cannot be empty`);
    }

    const validStatus = VALID_TYPES.find((t) => t === v);

    if (!validStatus) {
      throw new Error(`Invalid Project Member Status: ${v}`);
    }

    return new ProjectMemberStatus(validStatus);
  }

  get value(): ProjectMemberStatusType {
    return this._value;
  }

  static pending() {
    return new ProjectMemberStatus('PENDING');
  }
  static active() {
    return new ProjectMemberStatus('ACTIVE');
  }
  static inactive() {
    return new ProjectMemberStatus('INACTIVE');
  }
}
