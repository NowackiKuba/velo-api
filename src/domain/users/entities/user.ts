import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { BaseAggregateRoot } from '../../base';
import { ResetPasswordToken } from '../value-objects/reset-password-token.vo';
import { UserEmail } from '../value-objects/user-email.vo';
import { UserId } from '../value-objects/user-id.vo';
import { UserUsername } from '../value-objects/user-username.vo';

export type UserProps = {
  id?: string;
  username: string;
  email: string;
  password: string;
  resetPasswordToken?: string;
  activeProjectId?: string;
  lastResetPasswordAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export type UserJSON = {
  id: string;
  username: string;
  email: string;
  password: string;
  activeProjectId?: string;
  resetPasswordToken?: string;
  lastResetPasswordAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export class User extends BaseAggregateRoot<UserId> {
  private _username: UserUsername;
  private _email: UserEmail;
  private _activeProjectId?: ProjectId;
  private _resetPasswordToken?: ResetPasswordToken;
  private _lastResetPasswordAt?: Date;
  private _password: string;

  private constructor(props: UserProps) {
    const id = props?.id ? UserId.create(props.id) : UserId.generate();
    super(id, props.createdAt ?? new Date(), props.updatedAt ?? new Date(), props.deletedAt);
    this._username = UserUsername.create(props.username);
    this._email = UserEmail.create(props.email);
    this._password = props.password;
    this._activeProjectId = props.activeProjectId ? ProjectId.create(props.activeProjectId) : undefined;
    this._resetPasswordToken = props.resetPasswordToken ? ResetPasswordToken.create(props.resetPasswordToken) : undefined;
    this._lastResetPasswordAt = props.lastResetPasswordAt;
  }

  static create(props: UserProps) {
    return new User(props);
  }

  static reconstitute(props: {
    id: string;
    username: string;
    email: string;
    password: string;
    activeProjectId?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    resetPasswordToken?: string;
    lastResetPasswordAt?: Date;
  }) {
    return new User(props);
  }

  get username(): UserUsername {
    return this._username;
  }
  get email(): UserEmail {
    return this._email;
  }
  get password(): string {
    return this._password;
  }
  get activeProjectId(): ProjectId | undefined {
    return this._activeProjectId;
  }
  get resetPasswordToken(): ResetPasswordToken | undefined {
    return this._resetPasswordToken;
  }
  get lastResetPasswordAt(): Date | undefined {
    return this._lastResetPasswordAt;
  }

  updateActiveProject(id: string) {
    this._activeProjectId = ProjectId.create(id);
    this.touch();
  }

  requestPasswordReset() {
    this._resetPasswordToken = ResetPasswordToken.generate();
    this.touch();
  }

  updatePassword(hashedPassword: string) {
    this._password = hashedPassword;
    this._lastResetPasswordAt = new Date();
    this.touch();
  }

  toJSON(): UserJSON {
    return {
      id: this._id.value,
      username: this._username.value,
      email: this._email.value,
      password: this._password,
      activeProjectId: this._activeProjectId?.value,
      resetPasswordToken: this._resetPasswordToken?.value,
      lastResetPasswordAt: this._lastResetPasswordAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt ?? undefined,
    };
  }
}
