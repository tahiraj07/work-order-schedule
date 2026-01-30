import { Component, signal, inject, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  NaoSelectComponent,
  SelectOption,
} from "../../../../shared/components/nao-select/nao-select.component";
import { TimelineGridComponent } from "../../components/timeline-grid/timeline-grid.component";
import { WorkOrderFormPanelComponent } from "../../components/work-order-form-panel/work-order-form-panel.component";
import { WorkOrderService } from "../../../../core/services/work-order.service";
import { TimelineService } from "../../../../core/services/timeline.service";
import { TimelineZoomLevel, WorkOrderDocument } from "../../../../core/models/work-order.model";

@Component({
  selector: "app-timeline-page",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NaoSelectComponent,
    TimelineGridComponent,
    WorkOrderFormPanelComponent,
  ],
  templateUrl: "./timeline-page.component.html",
  styleUrl: "./timeline-page.component.scss",
})
export class TimelinePageComponent {
  private workOrderService = inject(WorkOrderService);
  private timelineService = inject(TimelineService);

  // Timescale options
  timescaleOptions: SelectOption[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ];

  selectedTimescale = signal<string | null>("month");

  // Form panel state
  isFormPanelOpen = signal(false);
  formMode: "create" | "edit" = "create";
  selectedWorkOrder?: WorkOrderDocument;
  initialStartDate?: Date;
  initialWorkCenterId?: string;

  constructor() {
    // Initialize zoom level
    this.timelineService.setZoomLevel("month");

    // Update zoom level when timescale changes
    effect(() => {
      const timescale = this.selectedTimescale();
      if (timescale) {
        this.timelineService.setZoomLevel(timescale as TimelineZoomLevel);
      }
    }, { allowSignalWrites: true });
  }

  // Get work centers from service
  get workCenters(): string[] {
    return this.workOrderService.getWorkCenters().map((wc) => wc.data.name);
  }

  onTodayClick(): void {
    // Center timeline on today
    this.timelineService.centerOnToday();
  }

  // Handle cell click to open create form
  onCellClick(event: { date: Date; workCenterName: string }): void {
    // Find work center by name
    const workCenter = this.workOrderService
      .getWorkCenters()
      .find((wc) => wc.data.name === event.workCenterName);

    this.formMode = "create";
    this.selectedWorkOrder = undefined;
    this.initialStartDate = event.date;
    this.initialWorkCenterId = workCenter?.docId;
    this.isFormPanelOpen.set(true);
  }

  // Handle edit work order
  onEditWorkOrder(workOrder: WorkOrderDocument): void {
    this.formMode = "edit";
    this.selectedWorkOrder = workOrder;
    this.initialStartDate = undefined;
    this.initialWorkCenterId = undefined;
    this.isFormPanelOpen.set(true);
  }

  // Handle delete work order (already handled in grid component)
  onDeleteWorkOrder(workOrder: WorkOrderDocument): void {
    // Already handled in grid component
  }

  // Handle form panel close
  onFormPanelClosed(): void {
    this.isFormPanelOpen.set(false);
  }

  // Handle form panel save
  onFormPanelSaved(workOrder: WorkOrderDocument): void {
    this.isFormPanelOpen.set(false);
    // Work order is already saved by the service
  }
}
