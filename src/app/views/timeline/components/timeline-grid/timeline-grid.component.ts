import { Component, Input, Output, EventEmitter, inject, computed, signal, effect, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkOrderDocument, WorkCenterDocument } from "../../../../core/models/work-order.model";
import { WorkOrderBarComponent } from "../work-order-bar/work-order-bar.component";
import { NaoTooltipComponent } from "../../../../shared/components/nao-tooltip/nao-tooltip.component";
import { WorkOrderService } from "../../../../core/services/work-order.service";
import { TimelineService } from "../../../../core/services/timeline.service";

@Component({
  selector: "app-timeline-grid",
  standalone: true,
  imports: [CommonModule, WorkOrderBarComponent, NaoTooltipComponent],
  templateUrl: "./timeline-grid.component.html",
  styleUrl: "./timeline-grid.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineGridComponent implements AfterViewInit {
  private workOrderService = inject(WorkOrderService);
  timelineService = inject(TimelineService); // Public for template access

  @Input() workCenters: string[] = [];
  @Output() cellClick = new EventEmitter<{ date: Date; workCenterName: string }>();
  @Output() editWorkOrder = new EventEmitter<WorkOrderDocument>();
  @Output() deleteWorkOrder = new EventEmitter<WorkOrderDocument>();

  @ViewChild("timelinePanel", { static: false }) timelinePanelRef!: ElementRef<HTMLDivElement>;

  containerWidth = signal<number>(1200);
  private scrollThreshold = 200;
  private isLoading = false;
  hoveredRowIndex = signal<number | null>(null);
  hoveredCellIndex = signal<number | null>(null);

  dateHeaders = computed(() => this.timelineService.generateDateHeaders());

  currentMonth = computed(() => {
    const today = new Date();
    return `${today.toLocaleString("default", { month: "short" })} ${today.getFullYear()}`;
  });

  currentZoom = computed(() => this.timelineService.currentZoom());

  formatDateHeader(date: Date): string {
    const zoomLevel = this.timelineService.currentZoom();
    
    switch (zoomLevel) {
      case "day":
        return date.toLocaleString("default", { month: "short", day: "numeric" });
      case "week":
        const weekNumber = this.timelineService.getWeekNumber(date);
        const year = this.timelineService.getWeekYear(date);
        return `W${weekNumber}-${year}`;
      case "month":
        return date.toLocaleString("default", { month: "short", year: "numeric" });
      default:
        return date.toLocaleString("default", { month: "short", year: "numeric" });
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  isCurrentPeriod(date: Date): boolean {
    const today = new Date();
    const zoomLevel = this.timelineService.currentZoom();
    
    switch (zoomLevel) {
      case "day":
        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      case "week":
        const weekStart = new Date(date);
        weekStart.setHours(0, 0, 0, 0);
        const dayOfWeek = weekStart.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        weekStart.setDate(weekStart.getDate() - daysToMonday);
        
        const todayWeekStart = new Date(today);
        todayWeekStart.setHours(0, 0, 0, 0);
        const todayDayOfWeek = todayWeekStart.getDay();
        const todayDaysToMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
        todayWeekStart.setDate(todayWeekStart.getDate() - todayDaysToMonday);
        
        return weekStart.getTime() === todayWeekStart.getTime();
      case "month":
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
      default:
        return false;
    }
  }

  isCurrentMonth(date: Date): boolean {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }

  getCurrentPeriodIndex(): number {
    const headers = this.dateHeaders();
    return headers.findIndex((date) => this.isCurrentPeriod(date));
  }

  getCurrentMonthIndex(): number {
    const headers = this.dateHeaders();
    return headers.findIndex((date) => this.isCurrentMonth(date));
  }

  getWorkOrdersForCenter(workCenterName: string): WorkOrderDocument[] {
    const workCenter = this.workOrderService
      .getWorkCenters()
      .find((wc) => wc.data.name === workCenterName);

    if (!workCenter) {
      return [];
    }

    return this.workOrderService.getWorkOrdersByCenter(workCenter.docId);
  }

  trackByWorkCenter(workCenter: string): string {
    return workCenter;
  }

  trackByDate(date: Date): number {
    return date.getTime();
  }

  trackByWorkOrderId(workOrder: WorkOrderDocument): string {
    return workOrder.docId;
  }

  constructor() {
    effect(() => {
      this.dateHeaders();
      setTimeout(() => this.updateContainerWidth(), 0);
    });
  }

  ngAfterViewInit(): void {
    this.updateContainerWidth();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", () => this.updateContainerWidth());
    }
    this.setupInfiniteScroll();
  }
  
  scrollToToday(): void {
    const panel = this.timelinePanelRef?.nativeElement;
    if (!panel) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPosition = this.timelineService.calculateDatePosition(
      today,
      this.containerWidth()
    );
    
    const viewportWidth = panel.clientWidth;
    const scrollPosition = todayPosition - (viewportWidth / 2);
    
    panel.scrollLeft = Math.max(0, scrollPosition);
  }

  private setupInfiniteScroll(): void {
  }

  // @upgrade: Consider implementing virtual scrolling for better performance with very large date ranges
  onScroll(): void {
    if (this.isLoading) return;

    const panel = this.timelinePanelRef?.nativeElement;
    if (!panel) return;

    const scrollLeft = panel.scrollLeft;
    const scrollWidth = panel.scrollWidth;
    const clientWidth = panel.clientWidth;

    const distanceFromRight = scrollWidth - (scrollLeft + clientWidth);
    if (distanceFromRight < this.scrollThreshold) {
      this.loadMoreColumnsRight();
    }

    if (scrollLeft < this.scrollThreshold) {
      this.loadMoreColumnsLeft();
    }
  }

  private loadMoreColumnsRight(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    this.timelineService.loadMoreColumnsRight();

    setTimeout(() => {
      this.updateContainerWidth();
      this.isLoading = false;
    }, 0);
  }

  private loadMoreColumnsLeft(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    const panel = this.timelinePanelRef?.nativeElement;
    if (!panel) return;

    const scrollLeft = panel.scrollLeft;
    const scrollWidth = panel.scrollWidth;

    this.timelineService.loadMoreColumnsLeft();

    setTimeout(() => {
      const newScrollWidth = panel.scrollWidth;
      const scrollDiff = newScrollWidth - scrollWidth;
      panel.scrollLeft = scrollLeft + scrollDiff;
      this.updateContainerWidth();
      this.isLoading = false;
    }, 0);
  }

  private updateContainerWidth(): void {
    const headers = this.dateHeaders();
    const cellWidth = this.getCellWidth();
    const calculatedWidth = headers.length * cellWidth;
    this.containerWidth.set(Math.max(calculatedWidth, 1200));
  }

  getCellWidth(): number {
    const zoomLevel = this.timelineService.currentZoom();
    switch (zoomLevel) {
      case "day":
        return 80;
      case "week":
        return 120;
      case "month":
        return 150;
      default:
        return 150;
    }
  }

  getBarLeft(workOrder: WorkOrderDocument): number {
    const startDate = this.parseDateString(workOrder.data.startDate);
    return this.timelineService.calculateDatePosition(startDate, this.containerWidth());
  }

  getBarWidth(workOrder: WorkOrderDocument): number {
    const startDate = this.parseDateString(workOrder.data.startDate);
    const endDate = this.parseDateString(workOrder.data.endDate);
    return this.timelineService.calculateBarWidth(startDate, endDate, this.containerWidth());
  }

  private parseDateString(dateString: string): Date {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  onCellMouseEnter(event: MouseEvent, rowIndex: number, cellIndex: number): void {
    const target = event.target as HTMLElement;
    const workOrderBar = target.closest('.work-order-bar');
    if (!workOrderBar) {
      this.hoveredRowIndex.set(rowIndex);
      this.hoveredCellIndex.set(cellIndex);
    } else {
      this.hoveredRowIndex.set(null);
      this.hoveredCellIndex.set(null);
    }
  }

  onCellMouseLeave(): void {
    this.hoveredRowIndex.set(null);
    this.hoveredCellIndex.set(null);
  }

  onRowClick(event: MouseEvent, workCenterName: string): void {
    const target = event.target as HTMLElement;
    if (target.closest(".work-order-bar") || target.closest(".vertical-lines")) {
      return;
    }

    const row = event.currentTarget as HTMLElement;
    const timelinePanel = this.timelinePanelRef?.nativeElement;
    if (!timelinePanel) return;

    const panelRect = timelinePanel.getBoundingClientRect();
    const clickX = event.clientX - panelRect.left;
    
    const clickedDate = this.timelineService.calculateDateFromPosition(
      clickX,
      this.containerWidth()
    );
    
    this.cellClick.emit({ date: clickedDate, workCenterName });
  }

  onEditWorkOrder(workOrder: WorkOrderDocument): void {
    this.editWorkOrder.emit(workOrder);
  }

  onDeleteWorkOrder(workOrder: WorkOrderDocument): void {
    if (confirm(`Are you sure you want to delete "${workOrder.data.name}"?`)) {
      this.workOrderService.deleteWorkOrder(workOrder.docId);
      this.deleteWorkOrder.emit(workOrder);
    }
  }
}
