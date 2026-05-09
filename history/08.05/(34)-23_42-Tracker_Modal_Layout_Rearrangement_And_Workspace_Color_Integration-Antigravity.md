User request: "change layout task(ad ability to edit) note subtasks date and pririty workspace and color"

### 1. Objective Reconstruction
- Reorganize the fields within the expanded task modal to follow the requested layout order perfectly:
  1. Task Title (with input for edit ability)
  2. Note (Description/Notes textarea)
  3. Subtasks (interactive list and input)
  4. Date and Priority (rendered side-by-side)
  5. Workspace and Color (rendered side-by-side with dynamic workspace selector and color circular picker)

### 2. Strategic Reasoning
- Side-by-side grid layouts optimize vertical screen real estate, reducing the overall height of the modal and preventing scroll fatigue. Placing descriptions and subtasks at the top prioritizes action-oriented metadata, while secondary filters like dates, priorities, workspaces, and categories are elegantly paired in two side-by-side flex rows.

### 3. Detailed Blueprint
- **`TrackerPage.tsx`**:
  - Imported Popovers (`Popover`, `PopoverTrigger`, `PopoverContent`) and `ChevronDown`.
  - Added store `entities` selector and derived `workspaces` memo.
  - Added local states `localWorkspaceId` and `localColor` inside the modal, synchronized reactive to the current task.
  - Rearranged elements in JSX inside the expanded modal: Title Header -> Description Textarea -> Subtasks List -> Flex Row with Due Date & Priority Selection -> Flex Row with Workspace Popover Dropdown & Category Color Circle Picker.

### 4. Operational Trace
1. Imported Popovers and ChevronDown from `@/components/ui/popover` and `lucide-react`.
2. Created `workspaces` derived selector.
3. Created `localWorkspaceId` and `localColor` states inside `TrackerPage` and updated `useEffect` and `handleSave` callback to track them.
4. Reorganized JSX layouts in `TrackerPage.tsx` under the Expanded Task Modal section to match the side-by-side rows.
5. Cleaned up syntax typo of `</div>div>` at the end of the workspace selector.

### 5. Status Assessment
- **Completed**: Fully reorganized the expanded task modal layout to match the exact requested sequence with side-by-side grouping for Due Date + Priority and Workspace + Category Color.
