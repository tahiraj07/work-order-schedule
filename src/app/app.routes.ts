import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/timeline",
    pathMatch: "full",
  },
  {
    path: "timeline",
    loadComponent: () =>
      import("./views/timeline/pages/timeline-page/timeline-page.component").then(
        (m) => m.TimelinePageComponent
      ),
  },
  {
    path: "showcase",
    loadComponent: () =>
      import("./shared/components/showcase/showcase.component").then((m) => m.ShowcaseComponent),
  },
];
