# Flowr Typography Specifications

This document outlines the current typography system used across the application. Modify the values below and I will apply them to the codebase.

## 1. Global Utility Definitions
Defined in `src/app/globals.css` and `update-globals.js`.

| Utility | Font Family | Weight (Numeric) | Letter Spacing | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| `font-display` | Crimson Pro | 500 (Medium) | -0.01em | Large page titles |
| `font-ui` | DM Sans | 500 (Medium) | 0.06em | General body text, button labels |
| `font-ui-label` | DM Sans | 500 (Medium) | 0.06em | Sidebar section headers (Pinned, Unsorted) |
| `font-widget-header`| DM Sans | 600 (SemiBold) | 0 | Widget/Dashboard section titles |
| `font-mono` | DM Mono | 500 (Medium) | 0 | Clock, Timer, Data cells |

DM mono: https://fonts.google.com/share?selection.family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500

## 2. Component-Specific Sizes
Applied via Tailwind classes in various components.

### Dashboard & Workspaces
- **Page Title:** `text-4xl` (~36px) | `font-display`
- **Widget Headers:** `text-[15px]` | `font-widget-header` | `font-semibold`
- **Widget Item Titles:** `text-[14px]`| `font-medium`
- **Task Due Dates:** `text-[10px]` | `font-bold`

### Sidebar
- **Section Headers:** `text-[13px]` | `font-ui-label` | `font-semibold`
- **Navigation Items:** `text-[14px]` | `font-medium`

### Editor (Blocks)
- **Title (H1):** `text-3xl` (~36px) | `font-bold` | `leading-[1.3]`
- **Heading (H2):** `text-2xl` (~24px) | `font-bold` | `leading-[1.3]`
- **Subheading (H3):** `text-xl` (~20px) | `font-semibold` | `leading-[1.3]`
- **Body Text:** `text-base` (~16px) | `font-ui` | `leading-[1.5]`
- **Code/Mono:** `text-sm` (~14px) | `font-mono`

### Database / Tables
- **Header Cells:** `text-[12px]` | `font-semibold` | `0.04em` tracking
- **Data Cells:** `text-[13px]` | `font-mono`

---
