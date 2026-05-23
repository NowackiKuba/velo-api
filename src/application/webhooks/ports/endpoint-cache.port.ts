export type CachedActiveEndpoint = {
  id: string;
  projectId: string;
  url: string;
  secret: string;
};

export interface EndpointCachePort {
  getActive(projectId: string): Promise<CachedActiveEndpoint | null>;
  setActive(projectId: string, endpoint: CachedActiveEndpoint): Promise<void>;
  invalidate(projectId: string): Promise<void>;
}
