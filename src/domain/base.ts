export type EntityId = {
  readonly value: string;
};

export abstract class BaseAggregateRoot<TId extends EntityId> {
  protected constructor(
    protected readonly _id: TId,
    protected readonly _createdAt: Date,
    protected _updatedAt: Date,
    protected _deletedAt?: Date | null,
  ) {}

  get id(): TId {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null | undefined {
    return this._deletedAt;
  }

  get isDeleted(): boolean {
    return this._deletedAt != null;
  }

  equals(other: BaseAggregateRoot<TId> | null | undefined): boolean {
    if (other == null) return false;
    if (this === other) return true;
    return this._id.value === other._id.value;
  }

  protected touch(updatedAt: Date = new Date()): void {
    this._updatedAt = updatedAt;
  }

  markDeleted(deletedAt: Date = new Date()): void {
    this._deletedAt = deletedAt;
    this.touch(deletedAt);
  }
}
