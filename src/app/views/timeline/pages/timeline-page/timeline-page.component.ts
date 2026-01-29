import { Component, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  NaoSelectComponent,
  SelectOption,
} from "../../../../shared/components/nao-select/nao-select.component";
import { TimelineGridComponent } from "../../components/timeline-grid/timeline-grid.component";
import { WorkOrderService } from "../../../../core/services/work-order.service";

@Component({
  selector: "app-timeline-page",
  standalone: true,
  imports: [CommonModule, FormsModule, NaoSelectComponent, TimelineGridComponent],
  templateUrl: "./timeline-page.component.html",
  styleUrl: "./timeline-page.component.scss",
})
export class TimelinePageComponent {
  private workOrderService = inject(WorkOrderService);

  // Timescale options
  timescaleOptions: SelectOption[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ];

  selectedTimescale = signal<string | null>("month");

  // Get work centers from service
  get workCenters(): string[] {
    return this.workOrderService.getWorkCenters().map((wc) => wc.data.name);
  }

  // Timeline months (Aug 2024 to Mar 2025)
  timelineMonths = [
    "Aug 2024",
    "Sep 2024",
    "Oct 2024",
    "Nov 2024",
    "Dec 2024",
    "Jan 2025",
    "Feb 2025",
    "Mar 2025",
  ];

  // Current month (Sep 2024)
  currentMonth = "Sep 2024";

  onTimescaleChange(value: string | null): void {
    this.selectedTimescale.set(value);
  }

  onTodayClick(): void {
    // Non-functional for now as per guide
    console.log("Today button clicked");
  }
}
