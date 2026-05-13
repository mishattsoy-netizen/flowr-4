0. Date and time of the request: 13.05 18:40

1. User request: "when i have chat page oppened and i refresh, i see first dahsboard nav button highlighted and it switched to chat, and same with tab and chat history list doesnt have skeleton animation. also chat main area doesnt have skeleton aniamtion, i see dashboard skeleton instead. fix it but dont brake sidebar and dashboard widgets again."

2. Objective Reconstruction:
Implement a robust server-side hydration lock using cookies to ensure that the correct page-specific skeletons (Chat or Dashboard) are rendered immediately during SSR, eliminating the client-side "Dashboard" flash and ensuring navigation highlights are accurate on load.

3. Strategic Reasoning:
Client-side sniffing is too slow to prevent the initial render of the default state. By writing the active view to a `flowr-initial-entity` cookie, we allow Next.js Server Components to determine the correct layout before the HTML even reaches the browser. Standardizing padding-top to `pt-3` across all content areas ensures that the transition from skeleton to real content causes zero layout shift.

4. Detailed Blueprint:
- Update `src/app/layout.tsx` to include a persistent cookie-syncing script.
- Convert `src/app/app/page.tsx` to an async Server Component that reads the cookie.
- Pass `initialEntityId` down through `Shell`, `Sidebar`, and `WorkspaceRouter`.
- Remove redundant `storeHydrated` and sniffing logic where props are available.

5. Operational Trace:
- Refactored `AppPage.tsx` to consume cookies.
- Updated root layout with a script to bridge `localStorage` to `flowr-initial-entity` cookie.
- Modified `Shell.tsx`, `Sidebar.tsx`, and `WorkspaceRouter.tsx` to support `initialEntityId` prop.
- Synced cookie back to server on every `activeEntityId` change in `Shell.tsx`.
- Standardized `pt-3` padding across `Sidebar.tsx`, `SidebarSkeleton.tsx`, and `ChatSkeleton.tsx`.

6. Status Assessment:
- Completed: Server-side skeleton selection works across refreshes.
- Completed: Zero vertical layout shifts during hydration.
- Completed: Correct navigation highlights on first render.
- Verified: All dashboard and chat widgets remain functional.
