# /ui — Frontend & UI Development Mode

UI development mode active. These supplement base CLAUDE.md rules.

## Approach

Before writing UI code:
1. **Visualize** — Describe the target design. Name specific inspirations (e.g., "clean dashboard like Linear", "pricing page like Stripe"). List colors, fonts, and visual tone.
2. **Design System First** — Check if `globals.css`/`tailwind.config.ts` need new tokens. Update design system BEFORE components.
3. **Component Plan** — List components and hierarchy
4. **Build** — Smallest components first, compose upward
5. **Verify** — Run `tsc --noEmit`. Screenshot at desktop (1280x720), tablet (768x1024), mobile (375x812). Check both light and dark modes.

## Design System Reference

### Color Tokens (globals.css)
```
Backgrounds:  bg-background, bg-card, bg-muted, bg-primary, bg-secondary, bg-accent, bg-destructive
Foreground:   text-foreground, text-muted-foreground, text-primary-foreground, text-destructive
Borders:      border-border, border-input, ring-ring
```

### Spacing
```
Tight:      gap-1 (4px), gap-2 (8px)
Normal:     gap-3 (12px), gap-4 (16px)
Relaxed:    gap-6 (24px), gap-8 (32px)
Section:    gap-12 (48px), gap-16 (64px)
Containers: p-4 md:p-6 lg:p-8
Page max:   max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### Typography
```
Display:  text-4xl font-bold tracking-tight
H1:       text-3xl font-semibold tracking-tight
H2:       text-2xl font-semibold
H3:       text-xl font-semibold
Body:     text-base
Small:    text-sm text-muted-foreground
Caption:  text-xs text-muted-foreground
```

### Component Variants (most used)
```
Button:  default | destructive | outline | secondary | ghost | link  (sizes: default | sm | lg | icon)
Badge:   default | secondary | destructive | outline
```

## Key Component Patterns

### Form (React Hook Form + Zod) — CRITICAL PATTERN
```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z.object({ name: z.string().min(1), email: z.string().email() })
type FormValues = z.infer<typeof schema>

export function MyForm() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Controlled Dialog + Form (common combo, error-prone)
```tsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"

export function EditDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>Make changes below.</DialogDescription>
        </DialogHeader>
        {/* Form content */}
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## Accessibility Checklist

Every component MUST:
- [ ] Semantic HTML (`<button>` not `<div onClick>`, `<a>` for navigation)
- [ ] Keyboard navigation (Tab, Enter/Space, Escape for modals)
- [ ] `aria-label` on icon-only buttons
- [ ] `<Label htmlFor>` on all form inputs
- [ ] `alt` text on images (empty `alt=""` for decorative)
- [ ] `sr-only` for screen-reader-only text
- [ ] Respect `prefers-reduced-motion` for animations
- [ ] Never skip heading levels (`h1` → `h2` → `h3`)

## Quality Standard Example

```tsx
// components/features/pricing-card.tsx
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface PricingCardProps {
  name: string
  price: number
  interval: "month" | "year"
  features: string[]
  highlighted?: boolean
  onSelect?: () => void
}

export function PricingCard({ name, price, interval, features, highlighted, onSelect }: PricingCardProps) {
  return (
    <Card className={cn("relative flex flex-col", highlighted && "border-primary shadow-lg")}>
      {highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight">${price}</span>
          <span className="text-sm text-muted-foreground">/{interval}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2" role="list">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={highlighted ? "default" : "outline"} onClick={onSelect}>
          Get Started
        </Button>
      </CardFooter>
    </Card>
  )
}
```

## Visual Verification

After UI changes:
1. Run `tsc --noEmit` to catch type errors
2. Screenshot at 1280px (desktop) and 375px (mobile)
3. Check both light and dark modes for contrast issues
4. Check: overflow, alignment, contrast, missing content, broken layouts
5. Capture console errors — fix React warnings or runtime errors

## SEO (every page)

```tsx
import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Page Title | Markovo",
  description: "Under 160 chars describing the page",
}
```

- Single `<h1>` per page, semantic HTML (`<main>`, `<article>`, `<nav>`)
- `alt` text on all images, `loading="lazy"` for below-fold `<Image>` components

$ARGUMENTS
