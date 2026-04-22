# Page Header

> Spec for the main greeting header used on the Dashboard page.

---

## Usage

- **Location:** Top of the Dashboard (`BentoDashboard` header row)
- **Source:** `src/components/dashboard/Dashboard.tsx`, lines 11–17
- **Behavior:** Displays a greeting with the user's name and the current date, formatted dynamically.

---

## Structure

```
<div>                          ← Container (no explicit padding)
  <h1>Welcome back, Misha</h1> ← Title
  <p>Wednesday, April 22</p>    ← Subtitle (date)
</div>
```

---

## States

### Default (only state — static display element)

#### Title — `<h1>`

| Property | Value |
|----------|-------|
| Font family | `font-display` → `var(--font-display)` → Crimson Pro |
| Font weight | 500 (via `font-display` utility) |
| Letter spacing | -0.01em (via `font-display` utility) |
| Font size | `text-4xl` → 2.25rem / 36px |
| Line height | `text-4xl` default → 2.5rem / 40px |
| Color | `text-foreground` → `var(--bone-100)` → `#E9E9E2` |
| Margin | `mb-1` → 0.25rem / 4px bottom |

**Tailwind classes:**
```
text-4xl font-display text-foreground mb-1
```

#### Subtitle — `<p>`

| Property | Value |
|----------|-------|
| Font family | Default `var(--font-sans)` → DM Sans |
| Font weight | `font-medium` → 500 |
| Font size | `text-sm` → 0.875rem / 14px |
| Line height | `text-sm` default → 1.25rem / 20px |
| Color | `text-muted-foreground` → `var(--dim-foreground)` → `var(--bone-60)` → `rgba(233, 233, 226, 0.60)` |

**Tailwind classes:**
```
text-muted-foreground text-sm font-medium
```

#### Container — `<div>`

| Property | Value |
|----------|-------|
| Padding | None (inherited from `BentoDashboard` parent) |
| Background | Transparent |
| Layout | Block (default) |

---

## Logic & Constraints

- Title text is hardcoded: `"Welcome back, Misha"`
- Subtitle is dynamic: `Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(now)`
- No hover, focus, active, or disabled states — purely presentational.
- Sits alongside action buttons (`New Item`, `New Task`) in the bento header flex row.

---

## Code Reference

```tsx
const title = (
  <div>
    <h1 className="text-4xl font-display text-foreground mb-1">Welcome back, Misha</h1>
    <p className="text-muted-foreground text-sm font-medium">
      {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(now)}
    </p>
  </div>
);
```
