import { BaseAggregateRoot } from '@/domain/base';
import { EndpointId } from '../value-objects/endpoint/endpoint-id.vo';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';

export type EndpointProps = {
  id?: string;
  projectId: string;
  name: string;
  description?: string;
  url: string;
  secret: string;
  secretPrefix: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export type EndpointJSON = {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  url: string;
  secret: string;
  secretPrefix: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export class Endpoint extends BaseAggregateRoot<EndpointId> {
  private _projectId: ProjectId;
  private _name: string;
  private _description?: string;
  private _url: string;
  private _secret: string;
  private _secretPrefix: string;
  private _isActive: boolean;

  private constructor(private readonly props: EndpointProps) {
    const id = props.id ? EndpointId.create(props.id) : EndpointId.generate();
    super(id, props.createdAt ?? new Date(), props.updatedAt ?? new Date(), props.deletedAt);
    this._projectId = ProjectId.create(props.projectId);
    this._name = props.name;
    this._description = props.description;
    this._url = props.url;
    this._secret = props.secret;
    this._secretPrefix = props.secretPrefix;
    this._isActive = props.isActive;
  }

  static create(props: EndpointProps) {
    return new Endpoint(props);
  }

  static reconstitute(props: {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    url: string;
    secret: string;
    secretPrefix: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
  }) {
    return new Endpoint(props);
  }

  update(props: Pick<EndpointProps, 'name' | 'description' | 'url' | 'secret' | 'secretPrefix' | 'isActive'>) {
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.description !== undefined) {
      this._description = props.description;
    }
    if (props.url !== undefined) {
      this._url = props.url;
    }
    if (props.secret !== undefined) {
      this._secret = props.secret;
    }
    if (props.secretPrefix !== undefined) {
      this._secretPrefix = props.secretPrefix;
    }
    if (props.isActive !== undefined) {
      this._isActive = props.isActive;
    }

    this.touch();
  }

  get projectId(): ProjectId {
    return this._projectId;
  }
  get name(): string {
    return this._name;
  }
  get description(): string | undefined {
    return this._description;
  }
  get url(): string {
    return this._url;
  }
  get secret(): string {
    return this._secret;
  }
  get secretPrefix(): string {
    return this._secretPrefix;
  }
  get isActive(): boolean {
    return this._isActive;
  }

  toJSON(): EndpointJSON {
    return {
      id: this._id.value,
      projectId: this._projectId.value,
      name: this._name,
      description: this._description,
      url: this._url,
      secret: this._secret,
      secretPrefix: this._secretPrefix,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt ?? undefined,
    };
  }
}
