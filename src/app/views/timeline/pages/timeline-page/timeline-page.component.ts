import { Component, signal, inject, effect, ViewChild } from "@angular/core";
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
import { NaoButtonComponent } from "../../../../shared/components/nao-button/nao-button.component";

@Component({
  selector: "app-timeline-page",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NaoSelectComponent,
    NaoButtonComponent,
    TimelineGridComponent,
    WorkOrderFormPanelComponent,
  ],
  templateUrl: "./timeline-page.component.html",
  styleUrl: "./timeline-page.component.scss",
})
export class TimelinePageComponent {
  private workOrderService = inject(WorkOrderService);
  private timelineService = inject(TimelineService);
  
  @ViewChild(TimelineGridComponent) timelineGrid!: TimelineGridComponent;

  timescaleOptions: SelectOption[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ];

  selectedTimescale = signal<string | null>("month");
  isFormPanelOpen = signal(false);
  formMode: "create" | "edit" = "create";
  selectedWorkOrder?: WorkOrderDocument;
  initialStartDate?: Date;
  initialWorkCenterId?: string;

  constructor() {
    this.timelineService.setZoomLevel("month");
    effect(() => {
      const timescale = this.selectedTimescale();
      if (timescale) {
        this.timelineService.setZoomLevel(timescale as TimelineZoomLevel);
      }
    }, { allowSignalWrites: true });
  }

  get workCenters(): string[] {
    return this.workOrderService.getWorkCenters().map((wc) => wc.data.name);
  }

  onTodayClick(): void {
    this.timelineService.centerOnToday();
    setTimeout(() => {
      this.timelineGrid?.scrollToToday();
    }, 100);
  }

  onCellClick(event: { date: Date; workCenterName: string }): void {
    const workCenter = this.workOrderService
      .getWorkCenters()
      .find((wc) => wc.data.name === event.workCenterName);

    this.formMode = "create";
    this.selectedWorkOrder = undefined;
    this.initialStartDate = event.date;
    this.initialWorkCenterId = workCenter?.docId;
    this.isFormPanelOpen.set(true);
  }

  onEditWorkOrder(workOrder: WorkOrderDocument): void {
    this.formMode = "edit";
    this.selectedWorkOrder = workOrder;
    this.initialStartDate = undefined;
    this.initialWorkCenterId = undefined;
    this.isFormPanelOpen.set(true);
  }

  onDeleteWorkOrder(workOrder: WorkOrderDocument): void {
    // Handled in grid component
  }

  onFormPanelClosed(): void {
    this.isFormPanelOpen.set(false);
  }

  onFormPanelSaved(workOrder: WorkOrderDocument): void {
    this.isFormPanelOpen.set(false);
  }
}
