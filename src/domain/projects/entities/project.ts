import { BaseAggregateRoot } from '@/domain/base';
import { ProjectId } from '../value-objects/project/project-id.vo';
import { ProjectColor } from '../value-objects/project/project-color.vo';

export type ProjectProps = {
  id?: string;
  name: string;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export type ProjectJSON = {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export class Project extends BaseAggregateRoot<ProjectId> {
  private _name: string;
  private _color: ProjectColor;

  private constructor(props: ProjectProps) {
    const id = props.id ? ProjectId.create(props.id) : ProjectId.generate();
    super(id, props.createdAt ?? new Date(), props.updatedAt ?? new Date(), props.deletedAt);

    this._name = props.name;
    this._color = ProjectColor.create(props.color);
  }

  static create(props: ProjectProps) {
    return new Project(props);
  }

  static reconstitute(props: { id: string; name: string; color: string; createdAt: Date; updatedAt: Date; deletedAt?: Date }) {
    return new Project(props);
  }

  update(props: Pick<ProjectProps, 'color' | 'name'>) {
    if (props.color !== undefined) {
      this._color = ProjectColor.create(props.color);
    }
    if (props.name !== undefined) {
      this._name = props.name;
    }

    this.touch();
  }

  get name(): string {
    return this._name;
  }
  get color(): ProjectColor {
    return this._color;
  }

  toJSON(): ProjectJSON {
    return {
      id: this._id.value,
      name: this._name,
      color: this._color.value,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt ?? undefined,
    };
  }
}
