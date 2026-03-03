# /api — Backend & API Development Mode

API/backend development mode active. These supplement base CLAUDE.md rules.

## Approach

1. **Contract first** — Define Zod schema for request/response before any logic
2. **Validate at boundaries** — All external input through Zod validation
3. **Errors are first-class** — Explicit error handling with proper HTTP status codes
4. **Type-safe end-to-end** — Zod schemas infer TypeScript types, shared between frontend/backend
5. **Secure by default** — Auth checks, rate limiting, input sanitization on every public endpoint

## CRITICAL: Next.js 15 `params` is a Promise

In all route handlers and page components, `params` must be awaited:
```tsx
// CORRECT (Next.js 15)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}

// WRONG — will cause runtime errors
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params  // ERROR: params is a Promise
}
```

## Route Handler Pattern

```tsx
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createItemSchema.parse(body)
    // Auth check → Database operation
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    console.error("POST /api/items error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100)
  // Auth check → Database query with pagination
  return NextResponse.json({ data: items, pagination: { page, limit, total } })
}
```

### Dynamic Route (GET/PATCH/DELETE follow same params pattern)
```tsx
// app/api/[resource]/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Fetch → 404 if not found → return data
  return NextResponse.json({ data: item })
}
// PATCH: await params, parse body with updateSchema, auth check (ownership), update
// DELETE: await params, auth check (ownership), delete
```

## Server Actions Pattern

```tsx
"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function createPost(data: CreatePostInput): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const parsed = createPostSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const post = await db.post.create({ data: { ...parsed.data, authorId: session.user.id } })
  revalidatePath("/posts")
  return { success: true, data: { id: post.id } }
}
```

## Database Patterns

### Prisma Conventions
```
- IDs: String @id @default(cuid())
- Always include createdAt/updatedAt
- Always @@index on foreign keys
- Always specify onDelete behavior explicitly (Cascade, SetNull, etc.)
- Relations: always name both sides
```

### Paginated Query
```tsx
async function getItems({ page = 1, limit = 20, search, status }: QueryParams) {
  const where = {
    ...(search && { name: { contains: search, mode: "insensitive" as const } }),
    ...(status && { status }),
  }
  const [items, total] = await Promise.all([
    db.item.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
    db.item.count({ where }),
  ])
  return { items, total, pages: Math.ceil(total / limit) }
}
```

## Zod Shared Validators

```tsx
// lib/validators.ts — reusable field validators
export const emailSchema = z.string().email("Invalid email address")
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters")
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens")
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
// Compose into feature schemas in lib/validators/[feature].ts
// Derive types: type MyInput = z.infer<typeof mySchema>
```

## Auth Helpers

```tsx
async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new AuthError("Unauthorized")
  return session.user
}

async function requireRole(role: "admin" | "editor") {
  const user = await requireAuth()
  if (user.role !== role) throw new AuthError("Forbidden")
  return user
}
```

### Middleware (NextAuth.js specific)
```tsx
// middleware.ts
export default auth((req) => {
  const isProtected = req.nextUrl.pathname.startsWith("/dashboard")
  const isAuthPage = req.nextUrl.pathname.startsWith("/login")
  if (isProtected && !req.auth) return NextResponse.redirect(new URL("/login", req.url))
  if (isAuthPage && req.auth) return NextResponse.redirect(new URL("/dashboard", req.url))
})

export const config = { matcher: ["/dashboard/:path*", "/login", "/register"] }
```

## HTTP Status Codes

```
200 Success (GET/PATCH) | 201 Created (POST) | 204 No Content (DELETE)
400 Bad Request | 401 Unauthorized | 403 Forbidden | 404 Not Found
409 Conflict | 422 Unprocessable Entity | 429 Rate Limited | 500 Internal Error
```

Error shape: `{ error: string, details?: Record<string, string[]>, code?: string }`
Success shape: `{ data: T, pagination?: { page, limit, total } }`

## Security Checklist

Every endpoint MUST:
- [ ] Validate all input with Zod
- [ ] Check authentication and authorization (resource ownership)
- [ ] Use parameterized queries (Prisma/Drizzle handle this)
- [ ] Return appropriate HTTP status codes
- [ ] Not expose internal error details to clients
- [ ] Rate limit public endpoints
- [ ] Validate file uploads (type, size) if applicable
- [ ] Sanitize user-generated content before storage

$ARGUMENTS
