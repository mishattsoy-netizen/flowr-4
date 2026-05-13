User request: "only keep collapse and expand animations"

### 0. Date and time of the request
12.05.2026 22:52

### 1. User request
"only keep collapse and expand animations"

### 2. Objective Reconstruction
Selectively restore smooth transitions for structural UI changes (collapsing/expanding containers) while keeping all interactive state changes (hover/select) at 0ms duration.

### 3. Strategic Reasoning
Purely visual hover effects can feel sluggish if they have a duration, but structural changes (like a sidebar moving) can be disorienting if they snap instantly. This hybrid approach ensures "snappy" buttons but "smooth" layout shifts.

### 4. Detailed Blueprint
- Revert sidebar width transitions in `Shell.tsx`.
- Revert grid-row expansion durations in `Sidebar.tsx` and `TreeItem.tsx`.
- Revert chevron rotation durations in `Sidebar.tsx`.
- Keep all `transition: none` or `duration-0` for backgrounds and text colors in `globals.css`.

### 5. Operational Trace
- Edited `src/components/layout/Shell.tsx` to restore sidebar width transitions.
- Edited `src/components/layout/Sidebar.tsx` and `TreeItem.tsx` to restore accordion animations.
- Updated `BRANDING/PREFERENCES.md` with the structural exception.

### 6. Status Assessment
- **Completed**: UI balance achieved between instant response and smooth structural layout.
