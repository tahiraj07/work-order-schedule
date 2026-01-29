import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NaoButtonComponent } from "../../../../shared/components/nao-button/nao-button.component";
import {
  NaoSelectComponent,
  SelectOption,
} from "../../../../shared/components/nao-select/nao-select.component";

@Component({
  selector: "app-timeline-page",
  standalone: true,
  imports: [CommonModule, FormsModule, NaoButtonComponent, NaoSelectComponent],
  templateUrl: "./timeline-page.component.html",
  styleUrl: "./timeline-page.component.scss",
})
export class TimelinePageComponent {
  // Timescale options
  timescaleOptions: SelectOption[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ];

  selectedTimescale = signal<string | null>("month");

  // Hardcoded work centers (matching the image)
  workCenters = [
    "Genesis Hardware",
    "Rodriques Electrics",
    "Konsulting Inc",
    "McMarrow Distribution",
    "Spartan Manufacturing",
  ];

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
