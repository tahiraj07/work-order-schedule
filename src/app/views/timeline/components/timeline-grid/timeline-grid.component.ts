import { Component, Input, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkOrderDocument, WorkCenterDocument } from "../../../../core/models/work-order.model";
import { WorkOrderBarComponent } from "../work-order-bar/work-order-bar.component";
import { WorkOrderService } from "../../../../core/services/work-order.service";

@Component({
  selector: "app-timeline-grid",
  standalone: true,
  imports: [CommonModule, WorkOrderBarComponent],
  templateUrl: "./timeline-grid.component.html",
  styleUrl: "./timeline-grid.component.scss",
})
export class TimelineGridComponent {
  private workOrderService = inject(WorkOrderService);

  @Input() workCenters: string[] = [];
  @Input() timelineMonths: string[] = [];
  @Input() currentMonth: string = "";

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
