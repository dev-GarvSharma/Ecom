# AI Coding Guide — Project Conventions
## 1. Project profile

- **Runtime/framework:** Node.js with Express.
- **Modules:** ES modules (`import` / `export`), including `.js` extensions in relative imports.
- **Database/ORM:** Sequelize.
- **Architecture:** Route files map endpoints to controller functions. Controllers contain request handling, validation, Sequelize queries, transaction management, and response-helper calls. Models define tables and associations.
- **Shared utilities:** `helpers/`, `utils/`, and `constants/`.
- **API prefix:** Routes are mounted centrally in `routes/indexRoutes.js`, generally under `/api/<resource>`.

Do not introduce a different framework, ORM, module system, or architectural layer unless explicitly requested.

## 2. Folder map

```text
database/
    migrations/           # Sequelize schema changes
    seeders/              # Reference and permission data
    models/               # Models data
src/
  config/                 # Database and application configuration
  constants/              # Shared enums/constants (roles, permissions, etc.)
  controllers/            # Express request handlers
  helpers/                # Shared response and domain helpers
  middlewares/            # Authentication, authorization, etc.
  models/                 # Sequelize models and associations
  routes/                 # Express routers
  utils/                  # Reusable focused utilities
  server.js               # Express app and server setup
```

Keep new files in the matching existing folder. Avoid placing database queries in route files.

## 3. Naming and formatting

- Use `camelCase` for variables and functions: `getStreamsList`, `addStream`.
- Use descriptive controller names based on the resource/action.
- Existing controller files commonly use names such as `streamController.js`; route files use `streamRoutes.js`.
- Model filenames are not fully consistent: examples include `StreamModel.js`, `SchoolsModal.js`, and `AssessmentModal.js`. Preserve the established filename for an existing model. For a new model, use the closest feature’s convention and use one spelling consistently.
- Database columns commonly use `snake_case`: `stream_name`, `school_id`, `created_at`.
- Request body fields and Sequelize attributes generally retain database-style `snake_case`.
- Use double quotes in most imports and strings, while recognizing that older files contain mixed quote styles.
- Use async/await and `try/catch` in controller handlers.
- Prefer early returns for validation and error responses.
- Do not reformat unrelated code or rename existing public fields just for stylistic consistency.

## 4. API response helper

**Always use `ResponseHelper` for controller responses.** Import it as:

```js
import ResponseHelper from "../helpers/ResponseHelper.js";
```

The helper is a singleton exported from `helpers/ResponseHelper.js`. Its methods build a consistent JSON shape:

```json
{
  "success": true,
  "status": 200,
  "message": "Resource fetched successfully!",
  "data": [],
  "meta": null,
  "error": null,
  "purpose": "Get Resource List API"
}
```

The common response methods are:

| Method                                                               | HTTP status | Typical use                                      |
| -------------------------------------------------------------------- | ----------: | ------------------------------------------------ |
| `ResponseHelper.OK(res, success, message, data, meta, purpose)`      |         200 | Successful reads and standard success responses  |
| `ResponseHelper.Created(res, success, message, data, meta, purpose)` |         201 | Successful create                                |
| `ResponseHelper.Accepted(res, message, data, meta, purpose)`         |         202 | Accepted/asynchronous work                       |
| `ResponseHelper.BadRequest(res, message, purpose)`                   |         400 | Invalid/missing input or business-rule rejection |
| `ResponseHelper.UnAuthorized(res, message, purpose)`                 |         401 | Missing/invalid authentication                   |
| `ResponseHelper.Forbidden(res, message, purpose)`                    |         403 | Authenticated but not permitted                  |
| `ResponseHelper.NotFound(res, success, message, purpose)`            |         404 | Missing resource                                 |
| `ResponseHelper.Conflict(res, message, data, purpose)`               |         409 | Conflict                                         |
| `ResponseHelper.Gone(res, message, purpose)`                         |         410 | No longer available                              |
| `ResponseHelper.UnprocessableEntity(res, message, purpose)`          |         422 | Semantically invalid input                       |
| `ResponseHelper.ISError(res, errorMessage, purpose)`                 |         500 | Unexpected server error                          |

Important details:

- Preserve the helper’s exact argument order. In particular, `NotFound` takes `success` as its second argument; `OK` and `Created` also take the success flag explicitly.
- Use a human-readable message ending in punctuation, consistent with nearby endpoints.
- Use a purpose string that identifies the endpoint, e.g. `"Add Stream API"` or `"Get Streams List API"`.
- For list endpoints, pass pagination metadata as the `meta` argument.
- Do not return raw `res.status(...).json(...)` from new controllers unless the endpoint has a documented special response contract.
- The helper currently sets `meta` to `null` when omitted. Error responses generally use `data: null`; `ISError` puts the underlying message in `error` while returning a generic client-facing message.

Example:

```js
return ResponseHelper.Created(
  res,
  true,
  "Stream added successfully!",
  newStream,
  null,
  "Add Stream API",
);
```

## 5. Routes

Route files use Express `Router`, import middleware and controller functions, and register HTTP methods.

Typical shape:

```js
import { Router } from "express";
import Auth from "../middlewares/Auth.js";
import { checkPermission } from "../middlewares/CheckPermission.js";
import { PERMISSIONS } from "../constants/Constants.js";
import {
  getStreamsList,
  addStream,
  updateStream,
  deleteStream,
} from "../controllers/streamController.js";

const router = Router();

// Follow the neighboring route file for the exact permission and middleware order.
router.get(
  "/",
  Auth,
  checkPermission(PERMISSIONS.SOME_PERMISSION),
  getStreamsList,
);
router.post("/", Auth, checkPermission(PERMISSIONS.SOME_PERMISSION), addStream);
router.put(
  "/:stream_uuid",
  Auth,
  checkPermission(PERMISSIONS.SOME_PERMISSION),
  updateStream,
);
router.delete(
  "/:stream_uuid",
  Auth,
  checkPermission(PERMISSIONS.SOME_PERMISSION),
  deleteStream,
);

export default router;
```

This is a structural example, not a claim that `SOME_PERMISSION` exists. Use real permission constants already defined in the project.

Rules:

- Keep route declarations thin. Business logic belongs in controllers.
- Use the existing `Auth` and `checkPermission(...)` middleware where the neighboring feature requires them.
- Follow the established HTTP method and path pattern for that resource. Existing endpoints commonly use UUIDs in route parameters for resource-specific operations.
- Export the router as default.
- Register a new route file in `routes/indexRoutes.js` and mount it under the appropriate `/api/...` prefix.
- Do not invent permission names. Inspect `constants/Constants.js`, permission seeders, and comparable routes first.

## 6. Controllers and CRUD flow

Controllers are named exported async functions, for example:

```js
export const getStreamsList = async (req, res) => {
  try {
    // Read credentials, query parameters, body, or route parameters.
    // Resolve UUIDs and validate input.
    // Query through Sequelize models.
    // Return through ResponseHelper.
  } catch (error) {
    return ResponseHelper.ISError(
      res,
      error.message || "Failed to retrieve streams",
      "Get Streams List API",
    );
  }
};
```

### Common CRUD behavior

**List**

- Read filters and pagination from `req.query`.
- Existing list handlers commonly default to `search = ""`, `page = 1`, and `limit = 10`.
- Parse page and limit with `parseInt(value, 10)` and compute `offset = (page - 1) * limit`.
- Use `findAndCountAll` when both rows and a total count are needed.
- Use `order`, `limit`, and `offset` explicitly.
- Build metadata in the existing shape when pagination is returned:

```js
const meta = {
  totalCount: count || 0,
  pageCount: Math.ceil((count || 0) / limitInt),
  currentPage: pageInt,
  perPage: limitInt,
  hasNextPage: pageInt < Math.ceil((count || 0) / limitInt),
  hasPrevPage: pageInt > 1,
};
```

- For search, use the shared `buildSearchQuery` utility when it fits the feature rather than duplicating search construction.
- Match the endpoint’s existing empty-result contract. Some handlers return a successful 200 with an empty array; others return `success: false` and a “not found” style message. Do not silently change an established response contract.

**Create**

- Read fields from `req.body`.
- Resolve tenant/school/user context from `req.credentials` when applicable.
- Validate required fields and check duplicates/business rules before inserting.
- Use `Model.create(...)`.
- Return `ResponseHelper.Created(...)` with the created record.

**Read one**

- Read the public identifier (often a UUID) from `req.params`.
- Query by that identifier and any required ownership/tenant scope.
- Return the established not-found response if absent.
- Return the record using `ResponseHelper.OK(...)` when found.

**Update**

- Resolve the record first, validate incoming values, and check conflicts.
- Use the existing model’s update pattern (`instance.update(...)` or `Model.update(...)`) as appropriate.
- Keep tenant/ownership restrictions in the query.
- Return the updated representation and a clear success message.

**Delete**

- Follow the model’s soft-delete/paranoid behavior and the closest existing delete controller.
- Do not hard-delete records unless the existing feature explicitly does so.
- Return the same status and response shape used by comparable endpoints.

### Validation, scope, and transactions

- Validate required fields explicitly, usually with early-return helper responses.
- Where a controller resolves a UUID to an internal numeric ID, use `CommonHelper.getIdFromUuid(...)` if it matches the existing use case. Inspect its signature and behavior before calling it.
- Multi-step writes commonly create a Sequelize transaction with `const t = await db.transaction()`, pass `{ transaction: t }` to relevant queries/writes, commit on success, and roll back on failure or early exits.
- If a transaction has been opened, ensure every early return rolls it back and every successful path commits it.
- Apply school/tenant scoping consistently. Do not assume a UUID alone grants access.
- Use `req.credentials` only in routes where authentication middleware populates it.
- Avoid leaking internal error details in the public `message`; use the helper’s `ISError` behavior for unexpected failures.

## 7. Models

Models are Sequelize definitions, typically using `Model.init(...)` or `sequelize.define(...)` depending on the existing file. Inspect the closest model before choosing the style.

Common conventions visible in models:

- Table and column names often use snake_case.
- UUID public identifiers commonly use `DataTypes.UUID` with `defaultValue: DataTypes.UUIDV4`.
- Numeric primary keys commonly use auto-incrementing `BIGINT`.
- Timestamp columns commonly map to `created_at`, `updated_at`, and `deleted_at`.
- Many models use Sequelize paranoid/soft-delete behavior with `paranoid: true`, `deletedAt: "deleted_at"`, and explicit timestamp field mappings.
- Models define associations near the end of the file, using `hasMany`, `belongsTo`, and other Sequelize association methods.
- Association aliases and foreign keys must match the `include` clauses used by controllers.

Example pattern (adapt to the actual project model setup):

```js
const Stream = sequelize.define(
  "stream",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    stream_uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    stream_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
  },
  {
    tableName: "stream",
    freezeTableName: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  },
);
```

This is illustrative. Do not copy it blindly: use the project’s configured Sequelize instance, model registration pattern, exact table name, and full existing column set.

## 8. Migrations

Migration files live in `database/migrations/` and use named `up` and `down` exports:

```js
import { DataTypes } from "sequelize";

export const up = async (queryInterface) => {
  await queryInterface.createTable("example_table", {
    id: {
      allowNull: false,
      autoIncrement: true,
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      allowNull: true,
      type: DataTypes.DATE,
      defaultValue: null,
    },
  });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("example_table");
};
```

Observed migration conventions:

- Use `DataTypes` from Sequelize.
- Use `queryInterface.createTable`, `addColumn`, `changeColumn`, `removeColumn`, or other query-interface methods for schema changes.
- Use snake_case database columns and explicit foreign-key references.
- Foreign keys commonly specify `onUpdate: "CASCADE"` and `onDelete: "CASCADE"` where appropriate.
- Many create-table migrations include `created_at`, `updated_at`, and nullable `deleted_at`.
- Some migrations guard table creation by calling `describeTable(...)` and checking whether the table exists. Existing files are not perfectly uniform.

Migration guidance:

- Prefer a new migration for schema changes; do not edit an already-applied migration unless specifically asked.
- Make `down` reverse the change made by `up`.
- Avoid destructive rollback behavior that could delete unrelated data.
- Check existing table names, foreign keys, indexes, nullability, and model definitions before writing a migration.
- Use the project’s actual migration runner and naming/timestamp convention. Do not guess a command if it is not confirmed by the package scripts.
- Keep migrations safe to run in the intended environment. If using existence guards, match the project’s existing style and ensure the guard does not hide a partially applied or incorrect schema.

## 9. Seeders

Seeders live in `database/seeders/` and use named `up` and `down` exports. Typical seeders use `queryInterface.bulkInsert(...)` and `queryInterface.bulkDelete(...)`.

Example:

```js
import { v4 as uuidv4 } from "uuid";

export const up = async (queryInterface) => {
  await queryInterface.bulkInsert("example_table", [
    {
      example_uuid: uuidv4(),
      name: "Example",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete("example_table", {
    name: "Example",
  });
};
```

Observed patterns:

- UUID values may be generated with `uuidv4()`.
- Timestamps are often explicitly set with `new Date()`.
- Seeders are used for lookup/reference data, roles, permissions, and feature access.
- Permission-related seeders often need matching role/permission mapping entries, not just a permission row.

Seeder guidance:

- Verify table/column names against migrations and models.
- For permission changes, inspect existing permission constants and related seeders so the new permission is connected to the correct roles.
- Prefer a targeted `where` clause in `bulkDelete` when practical. Some existing seeders delete all rows from a table; avoid copying that behavior if it could remove unrelated or environment-specific data.
- Consider whether the seeder can be safely rerun. Follow the project’s established approach for idempotency.
- Keep `down` scoped to the records inserted by that seeder.

## 10. Shared helpers and utilities

Before implementing reusable behavior, inspect:

- `helpers/ResponseHelper.js` for response formatting.
- `constants/Constants.js` for role and permission constants.
- Existing middleware for authentication and permission checks.

Reuse a helper when its semantics match. Do not add a second helper that duplicates an existing one with a different name. Keep feature-specific logic in its controller or a focused utility rather than turning `CommonHelper` into a dumping ground.

## 11. Authentication, authorization, and multi-tenant behavior

- Authentication and authorization are route middleware concerns, but controllers still need to enforce record ownership and tenant scope in their database queries.
- The project uses `req.credentials` for authenticated context. Existing code accesses fields such as `uuid`, `roleId`, and `id`; confirm the actual middleware payload before relying on a field.
- Permission identifiers are centralized in constants and represented in seed data. Reuse existing values and patterns.
- Some endpoints have role-specific behavior (for example, teacher-scoped lists). Preserve these rules when extending the endpoint.
- Do not bypass permission middleware merely to make a route work.

## 12. Query and response conventions

- Use Sequelize model methods (`findOne`, `findByPk`, `findAll`, `findAndCountAll`, `create`, `update`, `destroy`) consistent with the feature.
- Use `where` objects for filtering and `include` for associations.
- Import Sequelize operators or helpers from `"sequelize"` when needed, as seen in existing controllers.
- Exclude internal timestamps, tenant IDs, or other fields from responses when the neighboring endpoint does so.
- Use explicit `attributes`, `order`, and pagination options where response shape or performance requires them.
- For computed counts or SQL literals, follow the established query style and ensure table/column names are correct.
- Do not add N+1 query loops when the result can be fetched with a suitable include or aggregate.

## 13. AI assistant instructions

When generating or changing code in this repository, follow this checklist:

1. **Inspect before coding.** Read the closest controller, route, model, migration, seeder, and helper. Treat working neighboring code as the source of truth.
2. **Preserve the architecture.** Use Express routes, controller handlers, Sequelize models, shared helpers, and the existing middleware.
3. **Match response contracts.** Use `ResponseHelper` and preserve status codes, argument order, response messages, `purpose`, and pagination metadata.
4. **Implement complete CRUD only as requested.** Include validation, not-found handling, conflict checks, authorization/scope, and transaction handling where needed.
5. **Keep all layers aligned.** Route params/body fields, controller queries, model attributes, migration columns, associations, and seeder data must agree.
6. **Use UUIDs externally when the feature does.** Resolve to internal IDs only where the current code pattern requires it.
7. **Respect soft deletion.** Check `paranoid` configuration and existing delete behavior before choosing hard or soft deletion.
8. **Update integration points.** Register new routers, add real permission constants and seed mappings when required, and define associations where includes depend on them.
9. **Avoid unrelated refactors.** Do not rename legacy fields, alter existing API contracts, or “clean up” unrelated files without being asked.
10. **Be explicit about uncertainty.** If the repository does not show a clear convention, state the assumption and follow the closest example rather than inventing a project-wide rule.
11. **Validate the result.** Check imports/exports, route registration, migration reversibility, transaction paths, and any available lint/test scripts. Do not claim tests passed unless they were run.

### Expected output when asked to implement a feature

- List the files that need to be created or changed.
- Provide complete code for each requested file, not disconnected fragments, unless a patch is requested.
- Include migration and seeder changes when the feature requires schema or reference-data changes.
- Mention any permission constant/seed mapping or route registration needed.
- Summarize assumptions and verification performed.

## 14. Important observed inconsistencies

This codebase has evolved over time. Examples include:

- Model filenames use both `Model` and `Modal`, and some model names contain legacy misspellings.
- Quote style and indentation vary between files.
- Some list endpoints return `success: false` for empty results while others return a successful empty list.
- Some migrations include table-existence guards and others do not.
- Seeder rollback behavior varies, including broad deletes in older files.
- The codebase uses both `snake_case` database/request fields and `camelCase` JavaScript identifiers.

These are observations, not recommendations to spread every inconsistency. For new code, prioritize consistency with the nearest maintained feature and avoid unrelated cleanup.

## 15. Before finishing a coding task

- [ ] Imports use correct relative paths and `.js` extensions.
- [ ] New controller functions are exported and wired to routes.
- [ ] Router is mounted in `routes/indexRoutes.js`.
- [ ] Auth and permission middleware match the feature’s access rules.
- [ ] Request fields, UUIDs, internal IDs, and tenant scope are handled correctly.
- [ ] All responses use the correct `ResponseHelper` method and argument order.
- [ ] List metadata matches the existing API contract.
- [ ] Transactions commit or roll back on every path where one is opened.
- [ ] Model, migration, associations, and seeder definitions agree.
- [ ] Migration `down` reverses `up` safely.
- [ ] Seeder rollback does not remove unrelated records.
- [ ] No unrelated files or API behavior were changed.
- [ ] Relevant tests or checks were run, and results are reported honestly.
