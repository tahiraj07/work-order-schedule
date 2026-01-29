import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class TimelineService {
  // Hardcoded visible date range for now
  private readonly visibleStartDate: Date;
  private readonly visibleEndDate: Date;

  constructor() {
    // Set default range: 3 months back, 3 months forward
    const today = new Date();
    this.visibleStartDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    this.visibleEndDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);
  }

  /**
   * Convert date to pixel position
   */
  calculateDatePosition(date: Date, containerWidth: number): number {
    const start = this.visibleStartDate.getTime();
    const end = this.visibleEndDate.getTime();
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
    const start = this.visibleStartDate.getTime();
    const end = this.visibleEndDate.getTime();
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
}
