# Repository instructions

## Build, run, and tests

- `npm run dev` starts the API with `tsx --watch src/index.ts`.
- `npm run build` runs the strict TypeScript compiler and writes output to `dist/`.
- `npm start` runs the compiled API from `dist/index.js`.
- There is no configured lint script or test suite in `package.json`, and no project test files are currently present. For an individual TypeScript test file using the installed `tsx` runner and Node's test runner, use `npx tsx --test path/to/file.test.ts`.

The API loads its database settings and JWT secret from environment variables; keep local values in `.env`, which is ignored by Git. TypeORM connects to MySQL and currently has `synchronize: true` in `src/database/data-source.ts`.

## Architecture

`src/index.ts` initializes Express, mounts the module routers under `/api`, and starts listening only after `AppDataSource` connects. The feature code is grouped by domain under `src/modules/`:

- `*.routes.ts` declares paths and middleware.
- `*.schema.ts` defines Zod request validation and inferred request types.
- `*.controller.ts` translates Express requests into service calls and HTTP responses.
- `*.service.ts` holds business rules and coordinates repository operations.
- `*.repository.ts` contains TypeORM queries and database writes.
- `*.entity.ts` maps domain records and relations to MySQL tables.

The main flow is route → authentication/validation middleware → controller → service → repository → TypeORM entity. `src/database/data-source.ts` registers entities, while `src/constants/type.ts` centralizes domain state and role unions.

## Project conventions

- Add or change endpoints through the matching module's router, schema, controller, service, and repository as appropriate. Apply `authenticateJWT` to protected routes and validate route params, query strings, or bodies with `validateMiddleware` before calling the controller.
- Infer request DTO types from the Zod schemas with `z.infer` and use those types at the controller/service boundary rather than duplicating field definitions.
- Keep business validation in services and persistence details in repositories. Existing sala services use `errorHttp(status, message)` to attach an HTTP status to an `Error`; sala controllers return that status and message, log unexpected errors, and answer unexpected failures with a generic 500 response. Follow the target module's established response shape.
- `authenticateJWT` sets `req.user`; protected controllers read the authenticated ID from `req.user!.id`.
- Sala locations are supplied as `{ x, y }` where `x` is longitude and `y` is latitude. Repository writes convert them to MySQL WKT as `POINT(x y)`; spatial queries pass longitude before latitude.
- Keep sala and participation state/role values aligned with the unions in `src/constants/type.ts` and the corresponding entity column definitions.
- TypeScript runs with `strict: true`, ES modules, and `moduleResolution: "bundler"`; the build checks all files under `src/`.
