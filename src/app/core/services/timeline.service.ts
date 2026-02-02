import { Injectable, signal, computed } from "@angular/core";
import { TimelineZoomLevel } from "../models/work-order.model";

@Injectable({
  providedIn: "root",
})
export class TimelineService {
  private readonly zoomLevel = signal<TimelineZoomLevel>("month");
  private readonly visibleStartDate = signal<Date>(this.getInitialStartDate());
  private readonly visibleEndDate = signal<Date>(this.getInitialEndDate());
  private readonly loadedStartDate = signal<Date>(this.getInitialStartDate());
  private readonly loadedEndDate = signal<Date>(this.getInitialEndDate());

  readonly currentZoom = computed(() => this.zoomLevel());
  readonly visibleStart = computed(() => this.visibleStartDate());
  readonly visibleEnd = computed(() => this.visibleEndDate());

  constructor() {
    const start = this.getInitialStartDate();
    const end = this.getInitialEndDate();
    this.setVisibleRange(start, end);
    this.loadedStartDate.set(start);
    this.loadedEndDate.set(end);
  }

  private getInitialStartDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let date: Date;
    
    switch (this.zoomLevel()) {
      case "day":
        date = new Date(today);
        date.setDate(date.getDate() - 7);
        date.setHours(0, 0, 0, 0);
        break;
      case "week":
        date = new Date(today);
        date.setDate(date.getDate() - 7 * 7);
        date.setHours(0, 0, 0, 0);
        const dayOfWeek = date.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        date.setDate(date.getDate() - daysToMonday);
        break;
      case "month":
        date = new Date(today.getFullYear(), today.getMonth() - 7, 1);
        date.setHours(0, 0, 0, 0);
        break;
      default:
        date = new Date(today);
        date.setHours(0, 0, 0, 0);
    }
    return date;
  }

  private getInitialEndDate(): Date {
    const start = new Date(this.getInitialStartDate());
    const date = new Date(start);
    date.setHours(0, 0, 0, 0);
    switch (this.zoomLevel()) {
      case "day":
        date.setDate(date.getDate() + 14);
        break;
      case "week":
        date.setDate(date.getDate() + (14 * 7));
        break;
      case "month":
        date.setMonth(date.getMonth() + 14);
        break;
    }
    date.setHours(23, 59, 59, 999);
    return date;
  }

  setZoomLevel(level: TimelineZoomLevel): void {
    this.zoomLevel.set(level);
    const start = this.getInitialStartDate();
    const end = this.getInitialEndDate();
    this.setVisibleRange(start, end);
    this.loadedStartDate.set(start);
    this.loadedEndDate.set(end);
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
   * Uses header-based positioning to ensure bars align with header columns
   */
  calculateDatePosition(date: Date, containerWidth: number): number {
    // Normalize dates to midnight for accurate comparison
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    // Get headers to find the exact date range they cover
    const headers = this.generateDateHeaders();
    if (headers.length === 0) return 0;
    
    const firstHeaderDate = new Date(headers[0]);
    firstHeaderDate.setHours(0, 0, 0, 0);
    
    // Calculate the last header's end date based on zoom level
    const lastHeaderDate = new Date(headers[headers.length - 1]);
    lastHeaderDate.setHours(0, 0, 0, 0);
    
    let endDate: Date;
    switch (this.zoomLevel()) {
      case "day": 
        endDate = new Date(lastHeaderDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "week": 
        endDate = new Date(lastHeaderDate);
        endDate.setDate(endDate.getDate() + 6); 
        endDate.setHours(23, 59, 59, 999);
        break;
      case "month": 
        endDate = new Date(lastHeaderDate.getFullYear(), lastHeaderDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        endDate = new Date(this.loadedEndDate());
        endDate.setHours(23, 59, 59, 999);
    }
    
    const startTime = firstHeaderDate.getTime();
    const endTime = endDate.getTime();
    const dateTime = normalizedDate.getTime();

    if (dateTime < startTime) return 0;
    if (dateTime > endTime) return containerWidth;

    const ratio = (dateTime - startTime) / (endTime - startTime);
    return ratio * containerWidth;
  }

  /** 
   * This ensures bar positioning exactly matches header positions 
   */
  private getFirstHeaderDate(): Date { 
    const start = new Date(this.loadedStartDate());
    start.setHours(0, 0, 0, 0);
    return start;
  }

  /**
   * Convert pixel position to date 
   */
  calculateDateFromPosition(pixelPosition: number, containerWidth: number): Date {
    const firstHeaderDate = this.getFirstHeaderDate();
    const end = new Date(this.loadedEndDate());
    end.setHours(23, 59, 59, 999);
    
    const startTime = firstHeaderDate.getTime();
    const endTime = end.getTime();
    const ratio = Math.max(0, Math.min(1, pixelPosition / containerWidth));

    const dateTime = startTime + ratio * (endTime - startTime);
    return new Date(dateTime);
  }

  /**
   * Calculate bar width in pixels for a date range 
   */
  calculateBarWidth(startDate: Date, endDate: Date, containerWidth: number): number { 
    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);
     
    const normalizedEnd = new Date(endDate);
    normalizedEnd.setHours(23, 59, 59, 999);
    
    const startPos = this.calculateDatePosition(normalizedStart, containerWidth);
    const endPos = this.calculateDatePosition(normalizedEnd, containerWidth);
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
      if (excludeOrderId && order.docId === excludeOrderId) {
        return false;
      }

      if (order.data.workCenterId !== workOrder.data.workCenterId) {
        return false;
      }

      const orderStart = new Date(order.data.startDate);
      const orderEnd = new Date(order.data.endDate);

      return this.datesOverlap(startDate, endDate, orderStart, orderEnd);
    });
  }

  generateDateHeaders(): Date[] {
    const headers: Date[] = [];
    const start = new Date(this.loadedStartDate());
    const end = new Date(this.loadedEndDate());

    switch (this.zoomLevel()) {
      case "day":
        // Add each day
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const headerDate = new Date(d);
          headerDate.setHours(0, 0, 0, 0);
          headers.push(headerDate);
        }
        break;
      case "week": 
        const weekStart = new Date(start);
        weekStart.setHours(0, 0, 0, 0);
        
        // Generate week headers starting from this Monday
        for (let d = new Date(weekStart); d <= end; d.setDate(d.getDate() + 7)) {
          const headerDate = new Date(d);
          headerDate.setHours(0, 0, 0, 0);
          headers.push(headerDate);
        }
        break;
      case "month":
        // Add start of each month  
        const monthStart = new Date(start);
        monthStart.setHours(0, 0, 0, 0);
        for (let d = new Date(monthStart); d <= end; d.setMonth(d.getMonth() + 1)) {
          const headerDate = new Date(d);
          headerDate.setHours(0, 0, 0, 0);
          headers.push(headerDate);
        }
        break;
    }

    return headers;
  }

  /**
   * Load more columns when scrolling to the end (append to right)
   */
  loadMoreColumnsRight(): void {
    const currentEnd = new Date(this.loadedEndDate());
    const newEnd = new Date(currentEnd);
    
    switch (this.zoomLevel()) {
      case "day":
        newEnd.setDate(newEnd.getDate() + 15); 
        break;
      case "week":
        newEnd.setDate(newEnd.getDate() + (15 * 7));  
        break;
      case "month":
        newEnd.setMonth(newEnd.getMonth() + 15);  
        break;
    }
    
    this.loadedEndDate.set(newEnd);
  }

  /**
   * Load more columns when scrolling to the beginning (prepend to left)
   */
  loadMoreColumnsLeft(): void {
    const currentStart = new Date(this.loadedStartDate());
    const newStart = new Date(currentStart);
    
    switch (this.zoomLevel()) {
      case "day":
        newStart.setDate(newStart.getDate() - 15); 
        break;
      case "week":
        newStart.setDate(newStart.getDate() - (15 * 7)); 
        break;
      case "month":
        newStart.setMonth(newStart.getMonth() - 15); 
        break;
    }
    
    this.loadedStartDate.set(newStart);
  }

  /**
   * Get loaded date range (for infinite scroll)
   */
  getLoadedStartDate(): Date {
    return this.loadedStartDate();
  }

  getLoadedEndDate(): Date {
    return this.loadedEndDate();
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
        end.setDate(end.getDate() + 15);
        break;
      case "week":
        start.setDate(start.getDate() - (26 * 7)); 
        end.setDate(end.getDate() + (26 * 7)); 
        break;
      case "month":
        start.setMonth(start.getMonth() - 6);
        end.setMonth(end.getMonth() + 6);
        break;
    }

    this.setVisibleRange(start, end);
  }

  /**
   * Get week number for a given date  
   */
  getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return weekNumber;
  }

  getWeekYear(date: Date): number {
    return date.getFullYear();
  }
}
