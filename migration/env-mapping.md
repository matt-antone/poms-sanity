# Environment Variable Migration Mapping

## Source Site Environment Variables (poms2024/.env.local)

### Current Variables to Migrate

| Variable                            | Value                                      | Purpose                         | Migration Action                            |
| ----------------------------------- | ------------------------------------------ | ------------------------------- | ------------------------------------------- |
| `ALGOLIA_SEARCH_ADMIN_KEY`          | `20a1d3cd8eb3a427601ee6db0701096f`         | Algolia search admin operations | **MIGRATE** - Keep for search functionality |
| `ANALYZE`                           | `false`                                    | Bundle analysis flag            | **MIGRATE** - Keep for build optimization   |
| `CLOUDINARY_API_KEY`                | `818761254581938`                          | Cloudinary API access           | **DEPRECATE** - Images migrating to Sanity  |
| `CLOUDINARY_API_SECRET`             | `55ewIzCG85NgAyU6Vh-n1irrI9c`              | Cloudinary API secret           | **DEPRECATE** - Images migrating to Sanity  |
| `NEXT_PUBLIC_ALGOLIA_APP_ID`        | `X2IZL7Q4DB`                               | Algolia public app ID           | **MIGRATE** - Keep for search functionality |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`    | `2e4c3e3fa545842ab3b7f215dec1c2e7`         | Algolia public search key       | **MIGRATE** - Keep for search functionality |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `pomsassoc`                                | Cloudinary cloud name           | **DEPRECATE** - Images migrating to Sanity  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`  | Supabase anonymous key          | **EVALUATE** - Check if still needed        |
| `NEXT_PUBLIC_SUPABASE_URL`          | `https://gkvxhbzjqnbhpmqzjebi.supabase.co` | Supabase project URL            | **EVALUATE** - Check if still needed        |
| `NEXT_PUBLIC_TINA_CLIENT_ID`        | `662a58af-3a0a-4e9c-bbfd-5f1fba26c8be`     | Tina CMS client ID              | **DEPRECATE** - Migrating to Sanity         |
| `NODE_VERSION`                      | `20.3.0`                                   | Node.js version                 | **MIGRATE** - Keep for build consistency    |
| `SITE_URL`                          | `http://poms2024.netlify.app`              | Site URL                        | **UPDATE** - Change to new domain           |
| `TINA_BRANCH`                       | `production`                               | Tina CMS branch                 | **DEPRECATE** - Migrating to Sanity         |
| `TINA_SEARCH_TOKEN`                 | `dd7889b63520d6d9753d7e85971c6a9da9b08dbc` | Tina search token               | **DEPRECATE** - Migrating to Sanity         |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`     | `your-sanity-project-id`                   | Sanity project ID               | **MIGRATE** - Keep for Sanity integration   |
| `NEXT_PUBLIC_SANITY_DATASET`        | `production`                               | Sanity dataset                  | **MIGRATE** - Keep for Sanity integration   |
| `NEXT_PUBLIC_SANITY_API_VERSION`    | `2024-10-28`                               | Sanity API version              | **MIGRATE** - Keep for Sanity integration   |
| `NEXT_PUBLIC_SANITY_API_READ_TOKEN` | `your-sanity-read-token`                   | Sanity read token               | **MIGRATE** - Keep for Sanity integration   |
| `SANITY_API_TOKEN`                  | `your-sanity-write-token`                  | Sanity API token                | **MIGRATE** - Keep for Sanity integration   |
| `NEXT_PUBLIC_SITE_URL`              | `https://your-new-domain.com`              | Sanity site URL                 | **MIGRATE** - Keep for Sanity integration   |
| `BACKUP_SECRET`                     | `your-backup-secret`                       | Backup secret                   | **MIGRATE** - Keep for Sanity integration   |

## Target Site Environment Variables (nextjs-app/.env.local)

### Required Variables for Sanity Integration

```bash
# Build Configuration
ANALYZE=false
NODE_VERSION=20.3.0
NEXT_PUBLIC_SITE_URL=https://your-new-domain.com

# Sanity Configuration (Based on target site pattern)
NEXT_PUBLIC_SANITY_API_READ_TOKEN=your-sanity-read-token
NEXT_PUBLIC_SANITY_API_VERSION=2024-10-28
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
SANITY_API_TOKEN=your-sanity-write-token
SANITY_DATASET=production
SANITY_PROJECT_ID=your-sanity-project-id

# Algolia Search (Keep existing)
ALGOLIA_SEARCH_ADMIN_KEY=20a1d3cd8eb3a427601ee6db0701096f
NEXT_PUBLIC_ALGOLIA_APP_ID=X2IZL7Q4DB
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=2e4c3e3fa545842ab3b7f215dec1c2e7

# Supabase (Evaluate if still needed)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_URL=https://gkvxhbzjqnbhpmqzjebi.supabase.co

# Vercel Deployment (if using Vercel)
BACKUP_SECRET=your-backup-secret
VERCEL_OIDC_TOKEN=your-vercel-oidc-token
```

## Sanity Studio Environment Variables (studio/.env)

```bash
# Sanity Studio Configuration
SANITY_STUDIO_PROJECT_ID=your-sanity-project-id
SANITY_STUDIO_DATASET=production
SANITY_API_TOKEN=your-sanity-write-token
```

## Migration Actions

### 1. **Keep and Migrate**

- **Algolia Variables**: Maintain search functionality
- **ANALYZE**: Keep for build optimization
- **NODE_VERSION**: Maintain build consistency
- **SITE_URL**: Update to new domain
- **Sanity Configuration**: Project ID, dataset, API token
- **Sanity Studio Configuration**: Separate environment for Studio

### 2. **Deprecate and Remove**

- **Cloudinary Variables**: Images migrating to Sanity asset management
- **Tina CMS Variables**: No longer needed with Sanity

### 3. **Evaluate and Test**

- **Supabase Variables**: Check if still used in the application
- **Any other external services**: Verify if still needed

### 4. **Add New Variables**

- **Sanity Configuration**: Project ID, dataset, API token
- **Sanity Studio Configuration**: Separate environment for Studio

## Security Notes

- **API Tokens**: Ensure Sanity API token has appropriate permissions
- **Public vs Private**: Only expose necessary variables with `NEXT_PUBLIC_` prefix
- **Environment Separation**: Use different datasets for development/staging/production
- **Token Rotation**: Consider rotating Algolia keys after migration

## Validation Checklist

- [ ] All required Sanity variables are configured
- [ ] Algolia search still functions correctly
- [ ] No references to deprecated Cloudinary/Tina variables remain
- [ ] Supabase integration (if any) still works
- [ ] Build process completes successfully
- [ ] Sanity Studio can connect and edit content
- [ ] Frontend can fetch and display content from Sanity

## Next Steps

- 1.7.2: Identify variables to migrate (Algolia, Supabase) vs deprecate (Cloudinary, Tina)
- 1.7.3: Create environment variable mapping documentation
- 1.7.4: Determine required Sanity configuration variables

## 2. Variable Migration and Deprecation Analysis

| Variable Name                     | Purpose/Service | Action    | Notes                              |
| --------------------------------- | --------------- | --------- | ---------------------------------- |
| NEXT_PUBLIC_SANITY_PROJECT_ID     | Sanity          | MIGRATE   | Required for Sanity integration    |
| NEXT_PUBLIC_SANITY_DATASET        | Sanity          | MIGRATE   | Required for Sanity integration    |
| NEXT_PUBLIC_SANITY_API_VERSION    | Sanity          | MIGRATE   | Required for Sanity integration    |
| NEXT_PUBLIC_SANITY_API_READ_TOKEN | Sanity          | MIGRATE   | Required for Sanity integration    |
| SANITY_API_TOKEN                  | Sanity          | MIGRATE   | Required for Sanity integration    |
| NEXT_PUBLIC_SITE_URL              | Site URL        | MIGRATE   | Update to new domain               |
| BACKUP_SECRET                     | Vercel/Backup   | MIGRATE   | If using backup scripts            |
| ANALYZE                           | Build/Perf      | MIGRATE   | Optional, for build analysis       |
| NODE_VERSION                      | Build/Node      | MIGRATE   | Maintain build consistency         |
| ALGOLIA_SEARCH_ADMIN_KEY          | Algolia         | MIGRATE   | Needed for search integration      |
| NEXT_PUBLIC_ALGOLIA_APP_ID        | Algolia         | MIGRATE   | Needed for search integration      |
| NEXT_PUBLIC_ALGOLIA_SEARCH_KEY    | Algolia         | MIGRATE   | Needed for search integration      |
| NEXT_PUBLIC_SUPABASE_ANON_KEY     | Supabase        | MIGRATE?  | Only if Supabase is still required |
| NEXT_PUBLIC_SUPABASE_URL          | Supabase        | MIGRATE?  | Only if Supabase is still required |
| CLOUDINARY_URL                    | Cloudinary      | DEPRECATE | Migrating assets to Sanity         |
| TINA_BRANCH                       | Tina CMS        | DEPRECATE | No longer needed                   |
| TINA_SEARCH_TOKEN                 | Tina CMS        | DEPRECATE | No longer needed                   |
| TINA_TOKEN                        | Tina CMS        | DEPRECATE | No longer needed                   |

**Notes:**

- Supabase variables should only be migrated if the new stack still uses Supabase for auth or storage.
- Cloudinary variables are deprecated since assets will be migrated to Sanity.
- Tina CMS variables are deprecated as the CMS is being replaced.

## 3. Environment Variable Mapping Table

| Source Variable Name              | Target Variable Name              | Notes/Action                                  |
| --------------------------------- | --------------------------------- | --------------------------------------------- |
| NEXT_PUBLIC_SANITY_PROJECT_ID     | NEXT_PUBLIC_SANITY_PROJECT_ID     | Unchanged, required for Next.js and Sanity    |
| NEXT_PUBLIC_SANITY_DATASET        | NEXT_PUBLIC_SANITY_DATASET        | Unchanged, required for Next.js and Sanity    |
| NEXT_PUBLIC_SANITY_API_VERSION    | NEXT_PUBLIC_SANITY_API_VERSION    | Unchanged, required for Next.js and Sanity    |
| NEXT_PUBLIC_SANITY_API_READ_TOKEN | NEXT_PUBLIC_SANITY_API_READ_TOKEN | Unchanged, required for Next.js and Sanity    |
| SANITY_API_TOKEN                  | SANITY_API_TOKEN                  | Unchanged, required for Sanity write access   |
| NEXT_PUBLIC_SITE_URL              | NEXT_PUBLIC_SITE_URL              | Unchanged, update to new domain               |
| BACKUP_SECRET                     | BACKUP_SECRET                     | Unchanged, if using backup scripts            |
| ANALYZE                           | ANALYZE                           | Unchanged, optional for build analysis        |
| NODE_VERSION                      | NODE_VERSION                      | Unchanged, maintain build consistency         |
| ALGOLIA_SEARCH_ADMIN_KEY          | ALGOLIA_SEARCH_ADMIN_KEY          | Unchanged, for Algolia search integration     |
| NEXT_PUBLIC_ALGOLIA_APP_ID        | NEXT_PUBLIC_ALGOLIA_APP_ID        | Unchanged, for Algolia search integration     |
| NEXT_PUBLIC_ALGOLIA_SEARCH_KEY    | NEXT_PUBLIC_ALGOLIA_SEARCH_KEY    | Unchanged, for Algolia search integration     |
| NEXT_PUBLIC_SUPABASE_ANON_KEY     | NEXT_PUBLIC_SUPABASE_ANON_KEY     | Unchanged, only if Supabase is still required |
| NEXT_PUBLIC_SUPABASE_URL          | NEXT_PUBLIC_SUPABASE_URL          | Unchanged, only if Supabase is still required |
| CLOUDINARY_URL                    | (none)                            | Deprecated, assets migrated to Sanity         |
| TINA_BRANCH                       | (none)                            | Deprecated, Tina CMS replaced by Sanity       |
| TINA_SEARCH_TOKEN                 | (none)                            | Deprecated, Tina CMS replaced by Sanity       |
| TINA_TOKEN                        | (none)                            | Deprecated, Tina CMS replaced by Sanity       |
| SANITY_STUDIO_PROJECT_ID          | SANITY_STUDIO_PROJECT_ID          | New, required for Sanity Studio only          |
| SANITY_STUDIO_DATASET             | SANITY_STUDIO_DATASET             | New, required for Sanity Studio only          |
| SANITY_STUDIO_PREVIEW_URL         | SANITY_STUDIO_PREVIEW_URL         | New, required for Sanity Studio preview       |

**Notes:**

- All `SANITY_STUDIO_*` variables are only needed in the `studio/.env` file.
- All `NEXT_PUBLIC_SANITY_*` variables are needed in the Next.js app `.env.local`.
- Deprecated variables should be removed from the new environment files.

## 4. Required Sanity Configuration Variables

### Next.js App Environment Variables (`nextjs-app/.env.local`)

| Variable Name                     | Purpose                        | Required | Notes                                   |
| --------------------------------- | ------------------------------ | -------- | --------------------------------------- |
| NEXT_PUBLIC_SANITY_PROJECT_ID     | Sanity project identifier      | Yes      | Must match your Sanity project ID       |
| NEXT_PUBLIC_SANITY_DATASET        | Sanity dataset name            | Yes      | Usually 'production' or 'development'   |
| NEXT_PUBLIC_SANITY_API_VERSION    | Sanity API version             | Yes      | Set to '2024-10-28' for current version |
| NEXT_PUBLIC_SANITY_API_READ_TOKEN | Token for read-only API access | Yes      | For client-side data fetching           |
| SANITY_API_TOKEN                  | Token for write access         | Yes      | For server-side operations              |
| NEXT_PUBLIC_SITE_URL              | Site URL for canonical links   | Yes      | Update to new domain                    |

### Sanity Studio Environment Variables (`studio/.env`)

| Variable Name             | Purpose                       | Required | Notes                                   |
| ------------------------- | ----------------------------- | -------- | --------------------------------------- |
| SANITY_STUDIO_PROJECT_ID  | Sanity project identifier     | Yes      | Must match Next.js app project ID       |
| SANITY_STUDIO_DATASET     | Sanity dataset name           | Yes      | Must match Next.js app dataset          |
| SANITY_STUDIO_PREVIEW_URL | URL for preview functionality | Yes      | Usually 'http://localhost:3000' for dev |

### Optional Sanity Variables

| Variable Name             | Purpose                | Required | Notes                               |
| ------------------------- | ---------------------- | -------- | ----------------------------------- |
| SANITY_STUDIO_STUDIO_HOST | Custom studio host     | No       | Only if using custom studio hosting |
| SANITY_STUDIO_USE_CORS    | Enable CORS for studio | No       | For cross-origin studio access      |

**Important Notes:**

- All `NEXT_PUBLIC_*` variables are exposed to the client and should be safe for public use.
- `SANITY_API_TOKEN` should have write permissions for server-side operations.
- `NEXT_PUBLIC_SANITY_API_READ_TOKEN` should have read-only permissions for client-side use.
- The project ID and dataset must be identical between Next.js app and Sanity Studio.
