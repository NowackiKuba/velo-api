import { BaseAggregateRoot } from '@/domain/base';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { EndpointId } from '../value-objects/endpoint/endpoint-id.vo';
import { WebhookLogId } from '../value-objects/webhook-log/webhook-log-id.vo';
import { WebhookLogStatus, WebhookLogStatusType } from '../value-objects/webhook-log/webhook-log-status.vo';

export type WebhookLogProps = {
  id?: string;
  endpointId: string;
  projectId: string;
  provider: string;
  providerEventId?: string;
  requestHeaders: Record<string, unknown>;
  requestPayload: Record<string, unknown>;
  responseStatus?: number;
  responseHeaders?: Record<string, unknown>;
  responseBody?: string;
  status: string;
  errorMessage?: string;
  latencyMs?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export type WebhookLogJSON = {
  id: string;
  endpointId: string;
  projectId: string;
  provider: string;
  providerEventId?: string;
  requestHeaders: Record<string, unknown>;
  requestPayload: Record<string, unknown>;
  responseStatus?: number;
  responseHeaders?: Record<string, unknown>;
  responseBody?: string;
  status: WebhookLogStatusType;
  errorMessage?: string;
  latencyMs?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export class WebhookLog extends BaseAggregateRoot<WebhookLogId> {
  private _endpointId: EndpointId;
  private _projectId: ProjectId;
  private _provider: string;
  private _providerEventId?: string;
  private _requestHeaders: Record<string, unknown>;
  private _requestPayload: Record<string, unknown>;
  private _responseStatus?: number;
  private _responseHeaders?: Record<string, unknown>;
  private _responseBody?: string;
  private _status: WebhookLogStatus;
  private _errorMessage?: string;
  private _latencyMs?: number;

  private constructor(props: WebhookLogProps) {
    const id = props.id ? WebhookLogId.create(props.id) : WebhookLogId.generate();

    super(id, props.createdAt ?? new Date(), props.updatedAt ?? new Date(), props.deletedAt);
    this._endpointId = EndpointId.create(props.endpointId);
    this._projectId = ProjectId.create(props.projectId);
    this._provider = props.provider;
    this._providerEventId = props.providerEventId;
    this._requestHeaders = props.requestHeaders;
    this._requestPayload = props.requestPayload;
    this._responseStatus = props.responseStatus;
    this._responseHeaders = props.responseHeaders;
    this._responseBody = props.responseBody;
    this._status = WebhookLogStatus.create(props.status);
    this._errorMessage = props.errorMessage;
    this._latencyMs = props.latencyMs;
  }

  static create(props: WebhookLogProps) {
    return new WebhookLog(props);
  }

  static reconstitute(props: {
    id: string;
    endpointId: string;
    projectId: string;
    provider: string;
    providerEventId?: string;
    requestHeaders: Record<string, unknown>;
    requestPayload: Record<string, unknown>;
    responseStatus?: number;
    responseHeaders?: Record<string, unknown>;
    responseBody?: string;
    status: WebhookLogStatusType;
    errorMessage?: string;
    latencyMs?: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
  }) {
    return new WebhookLog(props);
  }

  update(
    props: Pick<WebhookLogProps, 'responseStatus' | 'responseHeaders' | 'responseBody' | 'status' | 'errorMessage' | 'latencyMs'>,
  ) {
    if (props.responseStatus !== undefined) {
      this._responseStatus = props.responseStatus;
    }
    if (props.responseHeaders !== undefined) {
      this._responseHeaders = props.responseHeaders;
    }
    if (props.responseBody !== undefined) {
      this._responseBody = props.responseBody;
    }
    if (props.status !== undefined) {
      this._status = WebhookLogStatus.create(props.status);
    }
    if (props.errorMessage !== undefined) {
      this._errorMessage = props.errorMessage;
    }
    if (props.latencyMs !== undefined) {
      this._latencyMs = props.latencyMs;
    }

    this.touch();
  }

  get endpointId(): EndpointId {
    return this._endpointId;
  }
  get projectId(): ProjectId {
    return this._projectId;
  }
  get provider(): string {
    return this._provider;
  }
  get providerEventId(): string | undefined {
    return this._providerEventId;
  }
  get requestHeaders(): Record<string, unknown> {
    return this._requestHeaders;
  }
  get requestPayload(): Record<string, unknown> {
    return this._requestPayload;
  }
  get responseStatus(): number | undefined {
    return this._responseStatus;
  }
  get responseHeaders(): Record<string, unknown> | undefined {
    return this._responseHeaders;
  }
  get responseBody(): string | undefined {
    return this._responseBody;
  }
  get status(): WebhookLogStatus {
    return this._status;
  }
  get errorMessage(): string | undefined {
    return this._errorMessage;
  }
  get latencyMs(): number | undefined {
    return this._latencyMs;
  }

  toJSON(): WebhookLogJSON {
    return {
      id: this._id.value,
      endpointId: this._endpointId.value,
      projectId: this._projectId.value,
      provider: this._provider,
      providerEventId: this._providerEventId,
      requestHeaders: this._requestHeaders,
      requestPayload: this._requestPayload,
      responseStatus: this._responseStatus,
      responseHeaders: this._responseHeaders,
      responseBody: this._responseBody,
      status: this._status.value,
      errorMessage: this._errorMessage,
      latencyMs: this._latencyMs,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt ?? undefined,
    };
  }
}
