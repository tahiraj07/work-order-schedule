# Work Order Schedule Timeline

An interactive timeline component for managing work orders across multiple work centers with day/week/month zoom levels.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
ng serve
```

3. Navigate to `http://localhost:4200/` - the timeline view loads directly at the root path.

## Routes

- `/` - Main timeline view (default)
- `/showcase` - Component showcase page for testing shared components

## Approach

The application is built with Angular 17+ using standalone components and signals for reactive state management.

**Architecture:**
- **Shared Components**: Reusable UI components (`nao-input`, `nao-select`, `nao-datepicker`, `nao-button`, `nao-badge`, `nao-tooltip`) following a consistent design system
- **Timeline Service**: Handles date calculations, positioning, and overlap detection
- **Work Order Service**: Manages work orders and work centers data with localStorage persistence
- **Timeline Grid**: Main component rendering work centers and scrollable timeline with infinite scroll
- **Work Order Bar**: Displays individual work orders on the timeline with status badges and actions
- **Form Panel**: Slide-out panel for creating/editing work orders with validation

**Key Features:**
- Infinite scrolling timeline that loads more columns as you scroll
- Click-to-create work orders by clicking empty timeline cells
- Overlap detection prevents conflicting work orders on the same work center
- Three zoom levels (day/week/month) with dynamic header formatting
- "Today" button to quickly center the timeline on the current date

## Libraries Used

- **@ng-bootstrap/ng-bootstrap** (v16.0.0) - For datepicker component (`ngb-datepicker`)
- **@ng-select/ng-select** (v12.0.7) - For dropdown/select components with custom styling
- **@angular/localize** - Required for i18n support in ng-bootstrap

These libraries were chosen because they're well-maintained, provide the required functionality (date picking and dropdowns), and allow for extensive customization to match the design requirements.

## Bonus Features Implemented

**Features:**
- ✅ **localStorage persistence** - Work orders are saved to localStorage and persist across page refreshes
- ✅ **Smooth animations** - Panel slide-in/out animations with fade effects
- ✅ **Keyboard navigation** - Escape key closes the form panel
- ✅ **Infinite scroll** - Timeline dynamically loads more date columns as you scroll left/right
- ✅ **"Today" button** - Quickly centers the timeline viewport on today's date
- ✅ **Tooltip on bar hover** - Shows work order name, status, and full date range on hover

**Polish:**
- ✅ **Custom datepicker styling** - Datepicker styled to match the design system
- ✅ **Accessibility** - ARIA labels, roles, and focus management implemented
- ✅ **Performance** - OnPush change detection and trackBy functions for optimized rendering

**Not Implemented:**
- Unit/E2E tests (test files exist but contain default boilerplate)
- AI prompts documentation
- Trade-offs documentation

**Future Improvements:**
- `@upgrade` comments added in code marking areas for future enhancement (virtual scrolling, backend integration)

## Build

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.
