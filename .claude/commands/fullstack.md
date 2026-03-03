# /fullstack — Full-Stack Feature Development Mode

Full-stack development mode active. These supplement base CLAUDE.md rules.

## Approach

### Phase 1: Contract (think first)
1. Define data model — entities, fields, relationships
2. Define API contract — endpoints/server actions with Zod schemas
3. Define UI components — pages, forms, lists, interactions
4. Identify shared types — what flows between backend and frontend

### Phase 2: Build Bottom-Up
1. Database schema (Prisma/Drizzle model + migration)
2. Zod validators (shared in `lib/validators/`)
3. Server layer (API routes or Server Actions)
4. UI components (pages + interactive components)
5. Wire together (forms → actions, lists → queries)

### Phase 3: Verify
1. Run `tsc --noEmit` to catch type errors across the full feature
2. Test API — correct data, error handling
3. Test UI — renders correctly, both light and dark modes
4. Test flow — form submit → save → UI reflects change

## Full-Stack Feature Template (CRUD Pattern)

### Step 1: Shared Types & Validators
```tsx
// lib/validators/post.ts
import { z } from "zod"

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
  published: z.boolean().default(false),
})
export const updatePostSchema = createPostSchema.partial()
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
```

### Step 2: Server Action
```tsx
// app/actions/posts.ts
"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { createPostSchema, type CreatePostInput } from "@/lib/validators/post"

// ActionResult<T> = { success: true, data: T } | { success: false, error: string, fieldErrors?: Record<string, string[]> }

export async function createPost(data: CreatePostInput) {
  const session = await auth()
  if (!session?.user) return { success: false as const, error: "Unauthorized" }

  const parsed = createPostSchema.safeParse(data)
  if (!parsed.success) return { success: false as const, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors }

  const post = await db.post.create({ data: { ...parsed.data, authorId: session.user.id } })
  revalidatePath("/posts")
  return { success: true as const, data: { id: post.id } }
}

export async function getPosts() {
  return db.post.findMany({ orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } })
}
```

### Step 3: List Page (Server Component)
```tsx
// app/posts/page.tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Posts | Markovo",
  description: "Manage your marketing posts",
}

export default async function PostsPage() {
  const posts = await getPosts()
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Posts</h1>
          <p className="text-muted-foreground mt-1">Manage your blog posts</p>
        </div>
        <Button asChild>
          <Link href="/posts/new"><Plus className="h-4 w-4 mr-2" aria-hidden="true" />New Post</Link>
        </Button>
      </div>
      {posts.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">No posts yet. Create your first post.</p>
      ) : (
        <div className="space-y-4">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
      )}
    </main>
  )
}
```

### Step 4: Form Component (Client Component)
```tsx
// components/posts/post-form.tsx
"use client"

import { useTransition } from "react"

export function PostForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const form = useForm<CreatePostInput>({ resolver: zodResolver(createPostSchema), defaultValues: { title: "", content: "", published: false } })

  function onSubmit(data: CreatePostInput) {
    startTransition(async () => {
      const result = await createPost(data) // Pass typed object directly — no FormData conversion needed
      if (!result.success) { toast({ title: "Error", description: result.error, variant: "destructive" }); return }
      toast({ title: "Post created" })
      router.push("/posts")
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        {/* Additional fields follow same FormField pattern */}
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create Post
        </Button>
      </form>
    </Form>
  )
}
```

## Data Flow

```
User Action → Client Component (RHF + Zod) → Server Action (Zod + auth) → Database → revalidatePath → Server Component re-renders → UI updates
```

## Key Principles

**Type Safety Chain:** Zod schema (single source of truth) → TypeScript type → Form validation → Server validation → Database query

**Where State Lives:**
| Type | Location | Example |
|------|----------|---------|
| Server data | Server Components + DB | Posts list, user profile |
| Form state | React Hook Form | Inputs, validation |
| UI state | useState | Modal open/closed, tabs |
| URL state | searchParams | Filters, pagination |
| Global client | Context / Zustand | Theme, auth status |

**Feature File Organization:**
```
lib/validators/[feature].ts    ← Zod schemas + types (shared)
app/actions/[feature].ts       ← Server Actions
app/[feature]/page.tsx         ← List page (Server Component)
app/[feature]/[id]/page.tsx    ← Detail page
app/[feature]/new/page.tsx     ← Create page
components/[feature]/          ← Feature components
```

## Integration Patterns

### Optimistic Updates (SWR)
```tsx
const { data, mutate } = useSWR("/api/posts", fetcher)
async function handleDelete(id: string) {
  mutate(data?.filter(p => p.id !== id), false) // Optimistic remove
  await fetch(`/api/posts/${id}`, { method: "DELETE" })
  mutate() // Revalidate
}
```

### Loading States
```tsx
<Suspense fallback={<div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>}>
  <PostList />
</Suspense>
```

### Error Boundary
```tsx
// app/[feature]/error.tsx
"use client"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center py-12 gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

## Checklist Before Completing

- [ ] Zod schemas defined and shared between client/server
- [ ] Server action/API route handles validation, auth, errors
- [ ] Server Component fetches and renders data
- [ ] Client Component handles forms with React Hook Form + Zod
- [ ] Loading states (Suspense + Skeleton)
- [ ] Error boundary page
- [ ] Empty state when no data
- [ ] Toast notifications for success/error
- [ ] Page `metadata` export for SEO
- [ ] Responsive layout (mobile + desktop)
- [ ] Light and dark mode tested
- [ ] Accessible (keyboard nav, labels, semantic HTML)
- [ ] Cache invalidation (revalidatePath/revalidateTag)
- [ ] `tsc --noEmit` passes with no errors

$ARGUMENTS
