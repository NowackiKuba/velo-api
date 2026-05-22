import Elysia from 'elysia';

export const printRoutes = () => (app: Elysia) => {
  app.onStart(({ server }) => {
    app.routes.forEach((route) => {
      const method = route.method.toUpperCase();
      const path = route.path;

      let methodColor = '\x1b[35m'; // Default: Magenta
      if (method === 'GET') methodColor = '\x1b[32m'; // Zielony
      if (method === 'POST') methodColor = '\x1b[33m'; // Żółty
      if (method === 'PUT') methodColor = '\x1b[34m'; // Niebieski
      if (method === 'DELETE') methodColor = '\x1b[31m'; // Czerwony

      const resetColor = '\x1b[0m';

      console.log(`  Mapped {${path}, ${methodColor}${method}${resetColor}} route`);
    });

    console.log(`\n🌍 Server listening on \x1b[36m${server?.hostname}:${server?.port}\x1b[0m\n`);
  });

  return app;
};
