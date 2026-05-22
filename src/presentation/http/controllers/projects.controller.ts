import { CreateProjectUseCase } from '@/application/projects/use-cases/create-project.use-case';
import { DeleteProjectUseCase } from '@/application/projects/use-cases/delete-project.use-case';
import { FindProjectByIdUseCase } from '@/application/projects/use-cases/find-project-by-id.use-case';
import { ListProjectsByUserIdUseCase } from '@/application/projects/use-cases/list-projects-by-user-id.use-case';
import { UpdateProjectUseCase } from '@/application/projects/use-cases/update-project.use-case';
import { Project } from '@/domain/projects/entities/project';
import Elysia from 'elysia';
import {
  CreateProjectBodySchema,
  ListProjectsQuerySchema,
  ProjectParamsSchema,
  UpdateProjectBodySchema,
} from '../schemas/project.schema';

const toPublicProject = (project: Project) => ({
  id: project.id.value,
  name: project.name,
  color: project.color.value,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
});

export const createProjectsController = (
  createProject: CreateProjectUseCase,
  findProjectById: FindProjectByIdUseCase,
  listProjectsByUserId: ListProjectsByUserIdUseCase,
  updateProject: UpdateProjectUseCase,
  deleteProject: DeleteProjectUseCase,
) =>
  new Elysia({ prefix: '/projects' })
    .post(
      '/',
      async ({ body, currentUser, set }) => {
        const res = await createProject.execute({
          name: body.name,
          color: body.color ?? '#ffffff',
          userId: currentUser!.id.value,
        });

        set.status = 201;
        return res;
      },
      {
        body: CreateProjectBodySchema,
      },
    )
    .get(
      '/',
      async ({ query, currentUser }) => {
        const page = await listProjectsByUserId.execute(currentUser!.id.value, {
          limit: query.limit,
          offset: query.offset,
          orderBy: query.orderBy,
          orderByField: query.orderByField,
          search: query.search,
        });

        return {
          data: page.data.map(toPublicProject),
          page: page.page,
        };
      },
      {
        query: ListProjectsQuerySchema,
      },
    )
    .get(
      '/:id',
      async ({ params }) => toPublicProject(await findProjectById.execute(params.id)),
      {
        params: ProjectParamsSchema,
      },
    )
    .patch(
      '/:id',
      async ({ params, body }) =>
        toPublicProject(
          await updateProject.execute({
            projectId: params.id,
            name: body.name,
            color: body.color,
          }),
        ),
      {
        params: ProjectParamsSchema,
        body: UpdateProjectBodySchema,
      },
    )
    .delete(
      '/:id',
      async ({ params, set }) => {
        const res = await deleteProject.execute(params.id);
        set.status = 200;
        return res;
      },
      {
        params: ProjectParamsSchema,
      },
    );
