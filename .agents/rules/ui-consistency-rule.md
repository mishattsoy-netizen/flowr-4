---
trigger: always_on
---

# PROTOCOL: UI/UX CONSISTENCY & "BRANDING" MANAGEMENT

## OBJECTIVE
To ensure 100% visual and functional consistency across the entire project. This protocol forces the AI to act as a "Brand Guardian," using two distinct tools: 
1. **Technical Specs:** Immutable files that store exact UI code.
2. **The Preference Engine:** A living document that tracks the user's design DNA, stylistic choices, and behavioral patterns.

---

## RULE 0: THE "READ-ONLY" MANDATE (SPEC FILES)
All spec files in the /BRANDING folder (e.g., `primary_button.md`) are **READ-ONLY** by default.
- **Zero-Edit Policy:** You are strictly forbidden from creating, deleting, or modifying any individual spec file without a direct command.
- **Activation Phrases:** You may only modify spec files if the user says: "Save this," "Remember this design," "Update specs for [X]," or "Yes, you have permission to update."

**EXCEPTION:** The `PREFERENCES.md` file (see Section 3) is an AI-managed workspace and does not require explicit permission for every update.

---

## 1. NAMING CONVENTIONS AND REFERENCING
Every saved element must have a specific, human-readable name defined or approved by the user.

- **Explicit Naming:** If the user says "Save this element as [Name]," you must create a file named `[name_in_snake_case].md`.
- **Referencing:** Once a name is established, you must refer to that element by that exact name in all future communications.
- **Naming Fallback:** If the user asks to save an element but does not provide a name, you must provide two options:
    1. A recommended name based on the element's function.
    2. An invitation for the user to write their own name.

---

## 2. THE STRUCTURE OF A "SPEC" (TECHNICAL)
Documentation must allow for 1:1 replication. You must document the object in EVERY state it possesses.

**Every spec file must include:**
- **States and Animations:** You MUST save specs for Default, Hover, Selected, Active, Focus, Disabled, and any custom animations.
- **Visual Properties:** Colors (Hex/RGBA), Border-radius, Padding/Margins, Shadows, Borders, and Typography.
- **Technical Framework:** Exact Tailwind classes, CSS properties, or SCSS variables.
- **Logic & Constraints:** Behavior (e.g., "Max-width is 400px").

---

## 3. PREFERENCES.MD (THE LIVING GUIDE)
If it does not exist, you must create `PREFERENCES.md` in the /BRANDING folder. This file serves as your long-term memory for the user’s design philosophy.

**AI Autonomy:**
- You have full permission to update, read, and refine this file automatically as you learn about the user.
- Whenever a new spec file is created or a design is discussed, you should update this file with relevant insights.

**Content Requirements:**
- **User Likes/Dislikes:** Track specific UI patterns the user praises or rejects.
- **Evolution:** Document what the user often asks to change (e.g., "The user consistently asks for more whitespace in headers").
- **Stylistic Philosophy:** Describe the overall "feel" and "look" the user is trying to achieve (e.g., "Minimalist, high-contrast, rounded corners").
- **Usage Logic:** Document where and how certain specs are used (e.g., "Uses default_tag for status updates, never for categories").
- **Technical Trends:** Note preferred technical implementations (e.g., "User prefers Flexbox over Grid for simple navbars").

---

## 4. THE PRE-CONSTRUCTION WORKFLOW
Before generating ANY code, follow this internal logic:

1. **SCAN:** Read `PREFERENCES.md` to understand the user's style and check for existing spec files.
2. **MATCH:**
    - **Full Match:** Use the exact specs from the /BRANDING folder.
    - **Partial Match:** Ask: "I found specs for [X]. Should I use these as a base, or follow the preferences for [Y]?"
    - **No Match:** Consult `PREFERENCES.md` to propose a design that fits the user's established taste. Ask: "I don't have specs for this, so I've designed it based on your preference for [Style]. Is this correct?"

---

## 5. REQUIRED COMMUNICATION LOOPS

### Scenario A: Saving with No Name Provided
> "I have captured the specs for this element. How should I name the file?
> 1. Use recommendation: **[recommended_name]**
> 2. Or, please provide your own custom name."

### Scenario B: Updating Preferences
> "I've noticed you prefer tighter spacing for sidebars. I have updated `PREFERENCES.md` to reflect this for future sections. Is this correct?"

---

## 6. DETAILED RULES OF CONDUCT
- **Identity Replay:** When copying from a spec, the code must be identical. Do not "improve" the design unless asked.
- **Contextual Awareness:** Every "Make a new page" request must begin with a review of both `PREFERENCES.md` and existing specs.
- **Folder Maintenance:** Keep a `manifest.md` inside the /BRANDING folder that lists all saved elements.

---

## FINAL VERIFICATION RULE
If you are ever unsure whether to save, name, or edit a SPEC file, you must stop and ask. However, you are expected to proactively manage the `PREFERENCES.md` file to become a more accurate and efficient designer over time.