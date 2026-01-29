import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkOrderDocument } from "../../../../core/models/work-order.model";
import { WorkOrderBarComponent } from "../work-order-bar/work-order-bar.component";

@Component({
  selector: "app-timeline-grid",
  standalone: true,
  imports: [CommonModule, WorkOrderBarComponent],
  templateUrl: "./timeline-grid.component.html",
  styleUrl: "./timeline-grid.component.scss",
})
export class TimelineGridComponent {
  @Input() workCenters: string[] = [];
  @Input() timelineMonths: string[] = [];
  @Input() currentMonth: string = "";

  // Hardcoded work orders for testing (will be replaced with dynamic data later)
  getWorkOrdersForCenter(workCenterName: string): WorkOrderDocument[] {
    // Hardcoded sample data - matching work center names
    if (workCenterName === "Genesis Hardware") {
      return [
        {
          docId: "wo-1",
          docType: "workOrder",
          data: {
            name: "entrix Ltd",
            workCenterId: "wc-1",
            status: "complete",
            startDate: "2024-08-15",
            endDate: "2024-10-15",
          },
        },
      ];
    }
    if (workCenterName === "Konsulting Inc") {
      return [
        {
          docId: "wo-2",
          docType: "workOrder",
          data: {
            name: "Konsulting Inc",
            workCenterId: "wc-3",
            status: "in-progress",
            startDate: "2024-10-15",
            endDate: "2024-11-20",
          },
        },
        {
          docId: "wo-3",
          docType: "workOrder",
          data: {
            name: "Compleks Systems",
            workCenterId: "wc-3",
            status: "in-progress",
            startDate: "2024-12-15",
            endDate: "2025-01-15",
          },
        },
      ];
    }
    if (workCenterName === "McMarrow Distribution") {
      return [
        {
          docId: "wo-4",
          docType: "workOrder",
          data: {
            name: "McMarrow Distribution",
            workCenterId: "wc-4",
            status: "blocked",
            startDate: "2024-11-15",
            endDate: "2024-12-15",
          },
        },
      ];
    }
    return [];
  }

  // Hardcoded positioning (will be calculated dynamically later)
  getBarLeft(workOrder: WorkOrderDocument, workCenterIndex: number): number {
    const position = this.getBarPosition(workOrder, workCenterIndex);
    return position.left;
  }

  getBarWidth(workOrder: WorkOrderDocument, workCenterIndex: number): number {
    const position = this.getBarPosition(workOrder, workCenterIndex);
    return position.width;
  }

  private getBarPosition(workOrder: WorkOrderDocument, workCenterIndex: number): { left: number; width: number } {
   
    const cellWidth = 150; // min-width of timeline-cell
   
    if (workCenterIndex === 0) {
      // Genesis Hardware - first bar
      return { left: 20, width: cellWidth * 2 };
    } else if (workCenterIndex === 2) {
      // Konsulting Inc - two bars
      if (workOrder.docId === "wo-2") {
        return { left: cellWidth + 20, width: cellWidth * 1.5 };
      } else {
        return { left: cellWidth * 3 + 20, width: cellWidth * 1.5 };
      }
    } else if (workCenterIndex === 3) {
      // McMarrow Distribution
      return { left: cellWidth * 2 + 20, width: cellWidth * 1.5 };
    }
    return { left: 20, width: cellWidth };
  }
}
