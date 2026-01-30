import { Component, Input, Output, EventEmitter, inject, computed, signal, effect, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkOrderDocument, WorkCenterDocument } from "../../../../core/models/work-order.model";
import { WorkOrderBarComponent } from "../work-order-bar/work-order-bar.component";
import { WorkOrderService } from "../../../../core/services/work-order.service";
import { TimelineService } from "../../../../core/services/timeline.service";

@Component({
  selector: "app-timeline-grid",
  standalone: true,
  imports: [CommonModule, WorkOrderBarComponent],
  templateUrl: "./timeline-grid.component.html",
  styleUrl: "./timeline-grid.component.scss",
})
export class TimelineGridComponent implements AfterViewInit {
  private workOrderService = inject(WorkOrderService);
  private timelineService = inject(TimelineService);

  @Input() workCenters: string[] = [];
  @Output() cellClick = new EventEmitter<{ date: Date; workCenterName: string }>();
  @Output() editWorkOrder = new EventEmitter<WorkOrderDocument>();
  @Output() deleteWorkOrder = new EventEmitter<WorkOrderDocument>();

  @ViewChild("timelinePanel", { static: false }) timelinePanelRef!: ElementRef<HTMLDivElement>;

  containerWidth = signal<number>(1200);

  // Get date headers from service
  dateHeaders = computed(() => this.timelineService.generateDateHeaders());

  // Get current month for highlighting
  currentMonth = computed(() => {
    const today = new Date();
    return `${today.toLocaleString("default", { month: "short" })} ${today.getFullYear()}`;
  });

  // Format date header for display
  formatDateHeader(date: Date): string {
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  }

  // Check if date is current month
  isCurrentMonth(date: Date): boolean {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }

  // Get the first current month date index
  getCurrentMonthIndex(): number {
    const headers = this.dateHeaders();
    return headers.findIndex((date) => this.isCurrentMonth(date));
  }

  // Get work orders for a specific work center by name
  getWorkOrdersForCenter(workCenterName: string): WorkOrderDocument[] {
    // Find work center by name
    const workCenter = this.workOrderService
      .getWorkCenters()
      .find((wc) => wc.data.name === workCenterName);

    if (!workCenter) {
      return [];
    }

    // Get work orders for this work center
    return this.workOrderService.getWorkOrdersByCenter(workCenter.docId);
  }

  constructor() {
    // Update container width when date headers change
    effect(() => {
      this.dateHeaders(); // Trigger when headers change
      setTimeout(() => this.updateContainerWidth(), 0);
    });
  }

  ngAfterViewInit(): void {
    // Update container width when view is ready
    this.updateContainerWidth();
    
    // Update on window resize
    if (typeof window !== "undefined") {
      window.addEventListener("resize", () => this.updateContainerWidth());
    }
  }

  private updateContainerWidth(): void {
    // Calculate width based on number of date headers and cell width
    const cellWidth = 150; // min-width of timeline-cell
    const headers = this.dateHeaders();
    const calculatedWidth = headers.length * cellWidth;
    this.containerWidth.set(Math.max(calculatedWidth, 1200));
  }

  // Calculate bar position based on dates
  getBarLeft(workOrder: WorkOrderDocument): number {
    const startDate = new Date(workOrder.data.startDate);
    return this.timelineService.calculateDatePosition(startDate, this.containerWidth());
  }

  getBarWidth(workOrder: WorkOrderDocument): number {
    const startDate = new Date(workOrder.data.startDate);
    const endDate = new Date(workOrder.data.endDate);
    return this.timelineService.calculateBarWidth(startDate, endDate, this.containerWidth());
  }

  // Handle row click to open create form
  onRowClick(event: MouseEvent, workCenterName: string): void {
    // Only trigger if clicking on empty area (not on a work order bar)
    const target = event.target as HTMLElement;
    if (target.closest(".work-order-bar") || target.closest(".vertical-lines")) {
      return;
    }

    // Calculate which date was clicked based on click position
    const row = event.currentTarget as HTMLElement;
    const rect = row.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const cellWidth = 150;
    const cellIndex = Math.floor(clickX / cellWidth);
    const dateHeaders = this.dateHeaders();
    
    if (cellIndex >= 0 && cellIndex < dateHeaders.length) {
      const clickedDate = dateHeaders[cellIndex];
      this.cellClick.emit({ date: clickedDate, workCenterName });
    }
  }

  // Handle edit work order
  onEditWorkOrder(workOrder: WorkOrderDocument): void {
    this.editWorkOrder.emit(workOrder);
  }

  // Handle delete work order
  onDeleteWorkOrder(workOrder: WorkOrderDocument): void {
    if (confirm(`Are you sure you want to delete "${workOrder.data.name}"?`)) {
      this.workOrderService.deleteWorkOrder(workOrder.docId);
      this.deleteWorkOrder.emit(workOrder);
    }
  }
}
