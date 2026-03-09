Build me a project management dashboard as a React app for tracking the rollout of operational digitization modules across Strathcona Resources' field sites. This is an internal tool for tracking implementation progress across three business units and their respective sites.



\## Business Units \& Sites



\*\*Cold Lake Thermal (Alberta)\*\*

\- Lindbergh

\- Orion

\- Tucker

\- Selina



\*\*Lloydminster Thermal (Saskatchewan)\*\*

\- Meota

\- Edam

\- Vawn

\- Glenbogie

\- Plover Lake

\- Taiga



\*\*Lloydminster Conventional (Alberta/Saskatchewan)\*\*

\- Bodo-Cosine

\- Bellis

\- Winter

\- Cactus Lake

\- Court

\- Druid



\## Scope Modules



The following 7 modules are being rolled out, but not every module applies to every site. The dashboard must respect these scoping rules:



1\. \*\*Shift Logs\*\* — Digital shift handover logging → ALL sites

2\. \*\*Facilities Logs\*\* — Facility inspection and condition logging → ALL sites

3\. \*\*Carseals\*\* — Carseal tracking and verification → ALL sites

4\. \*\*Critical Safety Bypass\*\* — Critical safety bypass management and tracking → ALL sites

5\. \*\*LOTO (Lock Out Tag Out)\*\* — Lock out tag out permit and tracking system → ALL sites

6\. \*\*iSolera Decommission\*\* — Decommissioning tracking within iSolera platform → \*\*Lindbergh ONLY\*\*

7\. \*\*Operator Rounds\*\* — Digital operator rounds checklists → \*\*Cold Lake Thermal and Lloydminster Conventional sites ONLY\*\* (excludes all Lloydminster Thermal sites)



\### Scoping Rules Summary

\- Lloydminster Thermal sites (Meota, Edam, Vawn, Glenbogie, Plover Lake, Taiga) do NOT get Operator Rounds

\- iSolera Decommission applies ONLY to Lindbergh

\- All other module × site combinations are in scope



The data model, seed data, matrix view, and all rollout item counts must reflect these exceptions. Out-of-scope cells in the Matrix View should be visually distinct (e.g., greyed out or marked N/A) and should NOT count toward completion percentages or KPI totals.



\## Dashboard Requirements



\### Data Model

\- Each in-scope combination of site × module is a discrete rollout item

\- Each rollout item should track:

&nbsp; - Status: Not Started | Discovery | Configuration | UAT | Training | Go-Live | Complete

&nbsp; - Target go-live date

&nbsp; - Actual go-live date (if complete)

&nbsp; - Owner / Lead (text field)

&nbsp; - Notes (free text)

&nbsp; - % complete (auto-calculated from status, or manual override)

&nbsp; - RAG status: Green | Amber | Red (manual selection)

&nbsp; - Blockers (free text, optional)



\### Views

1\. \*\*Matrix View (default)\*\* — A grid/table with sites as rows and modules as columns, showing RAG-colored status chips in each cell. Out-of-scope cells should render as greyed-out "N/A". Clicking an in-scope cell opens a detail panel or modal. Group rows by business unit with collapsible sections and subtotals showing completion % per business unit (calculated only from in-scope items).



2\. \*\*Module View\*\* — Select a single module and see only the sites where that module is in scope, listed with their status, target date, owner, and RAG. Show a progress bar for overall module rollout completion. For example, selecting iSolera Decommission should show only Lindbergh. Selecting Operator Rounds should show 10 sites (4 Cold Lake + 6 Conventional), not the Lloydminster Thermal sites.



3\. \*\*Site View\*\* — Select a single site and see only the modules that are in scope for that site, with their status, progress, and details. Show a progress bar for overall site completion. For example, selecting Meota should show 5 modules (no Operator Rounds, no iSolera Decommission). Selecting Lindbergh should show all 7.



4\. \*\*Timeline/Gantt View\*\* — A horizontal timeline showing each in-scope site-module combination as a bar, grouped by business unit. Show target go-live dates and highlight overdue items in red. Exclude out-of-scope combinations.



5\. \*\*Summary Dashboard\*\* — High-level KPIs at the top, all calculated from in-scope items only:

&nbsp;  - Total in-scope rollout items (should reflect the scoping exceptions)

&nbsp;  - % complete overall

&nbsp;  - # items Go-Live or Complete

&nbsp;  - # items flagged Red

&nbsp;  - # items overdue (target date passed but not Complete)

&nbsp;  - Completion % by business unit (3 donut or bar charts)

&nbsp;  - Completion % by module (7 horizontal progress bars, each reflecting only their applicable sites)



\### UX \& Styling

\- Use Tailwind CSS for styling

\- Clean, professional look — think internal enterprise tool, not flashy

\- Use a neutral color palette with Strathcona's brand colors if possible (dark navy, white, accents of teal/green)

\- Sidebar navigation for switching between views

\- All data should persist in React state (use useState/useReducer) with hardcoded initial seed data showing a realistic mix of statuses across in-scope items — some complete, some in progress, some not started, a few flagged red

\- Make cells and fields editable inline or via modal so a user could update status, dates, RAG, notes, etc.

\- Responsive but optimized for desktop (this will be used on laptops/monitors)



\### Tech Constraints

\- Single-file React component (.jsx)

\- No localStorage or sessionStorage

\- Use recharts for any charts

\- Use lucide-react for icons

\- No external API calls — all data in-memory

\- Seed with realistic dummy data so the dashboard looks populated on first load



Start by scaffolding the data model and the scoping logic that determines which site-module combinations are in scope, then build the seed data, then each view one at a time starting with the Matrix View.

