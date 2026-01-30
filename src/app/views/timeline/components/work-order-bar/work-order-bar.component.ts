import { Component, Input, Output, EventEmitter, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkOrderDocument } from "../../../../core/models/work-order.model";
import { NaoBadgeComponent } from "../../../../shared/components/nao-badge/nao-badge.component";
import { NaoTooltipComponent, TooltipMenuItem } from "../../../../shared/components/nao-tooltip/nao-tooltip.component";

// Simple service to track which work order bar has menu open
class WorkOrderBarMenuManager {
  private openBarId: string | null = null;

  setOpen(barId: string): void {
    this.openBarId = barId;
  }

  setClosed(barId: string): void {
    if (this.openBarId === barId) {
      this.openBarId = null;
    }
  }

  isOpen(barId: string): boolean {
    return this.openBarId === barId;
  }
}

const menuManager = new WorkOrderBarMenuManager();

@Component({
  selector: "app-work-order-bar",
  standalone: true,
  imports: [
    CommonModule,
    NaoBadgeComponent,
    NaoTooltipComponent,
  ],
  templateUrl: "./work-order-bar.component.html",
  styleUrl: "./work-order-bar.component.scss",
})
export class WorkOrderBarComponent {
  @Input() workOrder!: WorkOrderDocument;
  @Input() left: number = 0;
  @Input() width: number = 200;

  @Output() edit = new EventEmitter<WorkOrderDocument>();
  @Output() delete = new EventEmitter<WorkOrderDocument>();

  isMenuOpen = false;

  // Computed z-index based on whether this bar's menu is open
  get zIndex(): string {
    return menuManager.isOpen(this.workOrder.docId) ? "1" : "unset";
  }

  menuItems: TooltipMenuItem[] = [
    { label: "Edit", value: "edit" },
    { label: "Delete", value: "delete" },
  ];

  onThreeDotsClick(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      menuManager.setOpen(this.workOrder.docId);
    } else {
      menuManager.setClosed(this.workOrder.docId);
    }
  }

  onMenuItemSelected(item: TooltipMenuItem): void {
    if (item.value === "edit") {
      this.edit.emit(this.workOrder);
    } else if (item.value === "delete") {
      this.delete.emit(this.workOrder);
    }
    this.isMenuOpen = false;
    menuManager.setClosed(this.workOrder.docId);
  }

  onMenuClosed(): void {
    this.isMenuOpen = false;
    menuManager.setClosed(this.workOrder.docId);
  }

  getTooltipText(): string {
    return `${this.workOrder.data.name}\n${this.workOrder.data.status}\n${this.workOrder.data.startDate} - ${this.workOrder.data.endDate}`;
  }
}
