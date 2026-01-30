import { Injectable, signal, computed } from "@angular/core";
import { TimelineZoomLevel } from "../models/work-order.model";

@Injectable({
  providedIn: "root",
})
export class TimelineService {
  // Current zoom level (reactive signal)
  private readonly zoomLevel = signal<TimelineZoomLevel>("month");

  // Visible date range (reactive signals)
  private readonly visibleStartDate = signal<Date>(this.getInitialStartDate());
  private readonly visibleEndDate = signal<Date>(this.getInitialEndDate());

  // Computed values (derived from signals)
  readonly currentZoom = computed(() => this.zoomLevel());
  readonly visibleStart = computed(() => this.visibleStartDate());
  readonly visibleEnd = computed(() => this.visibleEndDate());

  constructor() {
    // Initialize with default range
    this.setVisibleRange(this.getInitialStartDate(), this.getInitialEndDate());
  }

  /**
   * Get initial start date based on zoom level
   */
  private getInitialStartDate(): Date {
    const today = new Date();
    const date = new Date(today);
    switch (this.zoomLevel()) {
      case "day":
        date.setDate(date.getDate() - 14); // ±2 weeks
        break;
      case "week":
        date.setDate(date.getDate() - 60); // ±2 months
        break;
      case "month":
        date.setMonth(date.getMonth() - 6); // ±6 months
        break;
    }
    return date;
  }

  /**
   * Get initial end date based on zoom level
   */
  private getInitialEndDate(): Date {
    const today = new Date();
    const date = new Date(today);
    switch (this.zoomLevel()) {
      case "day":
        date.setDate(date.getDate() + 14); // ±2 weeks
        break;
      case "week":
        date.setDate(date.getDate() + 60); // ±2 months
        break;
      case "month":
        date.setMonth(date.getMonth() + 6); // ±6 months
        break;
    }
    return date;
  }

  /**
   * Set zoom level and update visible range
   */
  setZoomLevel(level: TimelineZoomLevel): void {
    this.zoomLevel.set(level);
    this.setVisibleRange(this.getInitialStartDate(), this.getInitialEndDate());
  }

  /**
   * Update visible date range
   */
  setVisibleRange(start: Date, end: Date): void {
    this.visibleStartDate.set(start);
    this.visibleEndDate.set(end);
  }

  /**
   * Convert date to pixel position
   */
  calculateDatePosition(date: Date, containerWidth: number): number {
    const start = this.visibleStartDate().getTime();
    const end = this.visibleEndDate().getTime();
    const dateTime = date.getTime();

    if (dateTime < start) return 0;
    if (dateTime > end) return containerWidth;

    const ratio = (dateTime - start) / (end - start);
    return ratio * containerWidth;
  }

  /**
   * Convert pixel position to date
   */
  calculateDateFromPosition(pixelPosition: number, containerWidth: number): Date {
    const start = this.visibleStartDate().getTime();
    const end = this.visibleEndDate().getTime();
    const ratio = Math.max(0, Math.min(1, pixelPosition / containerWidth));

    const dateTime = start + ratio * (end - start);
    return new Date(dateTime);
  }

  /**
   * Calculate bar width in pixels for a date range
   */
  calculateBarWidth(startDate: Date, endDate: Date, containerWidth: number): number {
    const startPos = this.calculateDatePosition(startDate, containerWidth);
    const endPos = this.calculateDatePosition(endDate, containerWidth);
    return Math.max(0, endPos - startPos);
  }

  /**
   * Check if two date ranges overlap
   */
  datesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean {
    return start1 < end2 && start2 < end1;
  }

  /**
   * Check if a work order overlaps with any existing orders on the same work center
   */
  checkOverlap(
    workOrder: { data: { workCenterId: string; startDate: string; endDate: string } },
    existingOrders: Array<{ docId: string; data: { workCenterId: string; startDate: string; endDate: string } }>,
    excludeOrderId?: string
  ): boolean {
    if (!workOrder.data?.workCenterId || !workOrder.data?.startDate || !workOrder.data?.endDate) {
      return false;
    }

    const startDate = new Date(workOrder.data.startDate);
    const endDate = new Date(workOrder.data.endDate);

    return existingOrders.some((order) => {
      // Skip the order being edited
      if (excludeOrderId && order.docId === excludeOrderId) {
        return false;
      }

      // Only check orders on the same work center
      if (order.data.workCenterId !== workOrder.data.workCenterId) {
        return false;
      }

      const orderStart = new Date(order.data.startDate);
      const orderEnd = new Date(order.data.endDate);

      return this.datesOverlap(startDate, endDate, orderStart, orderEnd);
    });
  }

  /**
   * Generate date headers based on zoom level
   * @returns Array of dates representing column headers
   */
  generateDateHeaders(): Date[] {
    const headers: Date[] = [];
    const start = new Date(this.visibleStartDate());
    const end = new Date(this.visibleEndDate());

    switch (this.zoomLevel()) {
      case "day":
        // Add each day
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          headers.push(new Date(d));
        }
        break;
      case "week":
        // Add start of each week
        const weekStart = new Date(start);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
        for (let d = new Date(weekStart); d <= end; d.setDate(d.getDate() + 7)) {
          headers.push(new Date(d));
        }
        break;
      case "month":
        // Add start of each month
        const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
        for (let d = new Date(monthStart); d <= end; d.setMonth(d.getMonth() + 1)) {
          headers.push(new Date(d));
        }
        break;
    }

    return headers;
  }

  /**
   * Get today's date
   */
  getToday(): Date {
    return new Date();
  }

  /**
   * Center timeline on today's date
   */
  centerOnToday(): void {
    const start = new Date();
    const end = new Date();

    switch (this.zoomLevel()) {
      case "day":
        start.setDate(start.getDate() - 14);
        end.setDate(end.getDate() + 14);
        break;
      case "week":
        start.setDate(start.getDate() - 60);
        end.setDate(end.getDate() + 60);
        break;
      case "month":
        start.setMonth(start.getMonth() - 6);
        end.setMonth(end.getMonth() + 6);
        break;
    }

    this.setVisibleRange(start, end);
  }
}
