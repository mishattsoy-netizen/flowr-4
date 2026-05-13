# Spec: Options Popup & List Items

Standardized styles for context menus, sorting menus, and action popups across the application. This specification officially supersedes and replaces the legacy `popup_glass` spec.

## Component: Popup Container (`popup-glass-small` / `popup-glass-big`)
- **Background**: `var(--color-panel)` (Deep charcoal)
- **Border**: `1px solid var(--bone-12)`
- **Radius**: `var(--radius-regular)` (12px) for small, `var(--radius-big)` (20px) for big
- **Shadow**: `0 4px 12px rgba(0, 0, 0, 0.3)`
- **Padding**: Typically `p-1.5`
- **Transitions**: **None (0ms)** — all hover and selection states must be instant.

## Element: Action Item (`popup-item`)
- **Layout**: `flex items-center gap-3`
- **Typography**: `13.5px`, `var(--bone-70)`
- **Padding**: `px-3 py-1.5`
- **Border Radius**: `var(--radius-medium)` (8px)
- **Hover State**:
  - **Background**: `rgba(255, 255, 255, 0.1)` (white/10)
  - **Text**: `var(--bone-100)`
- **Icons**:
  - **Size**: `16px` (centered in 20px optical area)
  - **Color**: Inherits from text (`var(--bone-70)` -> `var(--bone-100)`)

## Element: Danger Item (`popup-item-danger`)
- **Text Color**: `var(--color-danger)`
- **Hover State**:
  - **Background**: `rgba(255, 96, 96, 0.1)` (danger/10)
  - **Text Color**: `var(--color-danger)`

## Element: Group Header / Submenu Trigger
- **Layout**: Includes a chevron icon on the right
- **Icon (Chevron)**: `var(--bone-30)` (dimmed)
- **Selection State**: Active group or selected item shows a checkmark icon on the far right.

## Element: Divider (`popup-divider`)
- **Height**: `1px`
- **Background**: `rgba(255, 255, 255, 0.05)` (white/5)
- **Margins**: `my-[3px] mx-3`

## Implementation (Tailwind Utilities)
```css
@utility popup-item {
  @apply flex items-center gap-3 w-full px-3 py-1.5 text-[13.5px] cursor-pointer whitespace-nowrap text-[var(--bone-70)] hover:text-[var(--bone-100)] hover:bg-white/10 rounded-[var(--radius-medium)];
}

@utility popup-item-danger {
  @apply popup-item !text-danger;
  &:hover {
    @apply !bg-danger/10 !text-danger;
  }
}

@utility popup-divider {
  @apply h-px bg-white/5 my-[3px] mx-3;
}
```
