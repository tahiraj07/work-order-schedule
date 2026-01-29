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
}
