export const projectRoom = (projectId: string) => `project:${projectId}`;

export type PublishToFront = (projectId: string, data: unknown) => void;

export const createPublishToFront = (publish: (topic: string, data: string) => void): PublishToFront => {
  return (projectId, data) => {
    publish(projectRoom(projectId), JSON.stringify(data));
  };
};
