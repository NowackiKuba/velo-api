import { BaseAggregateRoot } from '@/domain/base';
import { ProjectMemberId } from '../value-objects/project-member/project-member-id.vo';
import { ProjectMemberStatus, ProjectMemberStatusType } from '../value-objects/project-member/project-member-status.vo';
import { ProjectId } from '../value-objects/project/project-id.vo';
import { UserId } from '@/domain/users/value-objects';
import { Permission, ProjectMemberPermissions } from '../value-objects/project-member/project-member-permissions.vo';

export type ProjectMemberProps = {
  id?: string;
  projectId: string;
  userId: string;
  permissions: string[];
  invitedById: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export type ProjectMemberJSON = {
  id: string;
  projectId: string;
  userId: string;
  permissions: Permission[];
  invitedById: string;
  status: ProjectMemberStatusType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export class ProjectMember extends BaseAggregateRoot<ProjectMemberId> {
  private _projectId: ProjectId;
  private _userId: UserId;
  private _permissions: ProjectMemberPermissions;
  private _invitedById: UserId;
  private _status: ProjectMemberStatus;

  private constructor(props: ProjectMemberProps) {
    const id = props.id ? ProjectMemberId.create(props.id) : ProjectMemberId.generate();
    super(id, props.createdAt ?? new Date(), props.updatedAt ?? new Date(), props.deletedAt);

    this._projectId = ProjectId.create(props.projectId);
    this._userId = UserId.create(props.userId);
    this._permissions = ProjectMemberPermissions.create(props.permissions);
    this._invitedById = UserId.create(props.invitedById);
    this._status = ProjectMemberStatus.create(props.status);
  }

  static create(props: ProjectMemberProps) {
    return new ProjectMember(props);
  }

  static reconstitute(props: {
    id: string;
    projectId: string;
    userId: string;
    permissions: string[];
    invitedById: string;
    status: ProjectMemberStatusType;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
  }) {
    return new ProjectMember(props);
  }

  update(props: Pick<ProjectMemberProps, 'permissions' | 'status'>) {
    if (props.permissions !== undefined) {
      this._permissions = ProjectMemberPermissions.create(props.permissions);
    }

    if (props.status !== undefined) {
      this._status = ProjectMemberStatus.create(props.status);
    }

    this.touch();
  }

  get projectId(): ProjectId {
    return this._projectId;
  }
  get userId(): UserId {
    return this._userId;
  }
  get permissions(): ProjectMemberPermissions {
    return this._permissions;
  }
  get invitedById(): UserId {
    return this._invitedById;
  }
  get status(): ProjectMemberStatus {
    return this._status;
  }

  toJSON(): ProjectMemberJSON {
    return {
      id: this._id.value,
      projectId: this._projectId.value,
      userId: this._userId.value,
      permissions: [...this._permissions.value],
      invitedById: this._invitedById.value,
      status: this._status.value,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt ?? undefined,
    };
  }
}
