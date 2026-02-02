import { Component, Input, Output, EventEmitter, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkOrderDocument } from "../../../../core/models/work-order.model";
import { NaoBadgeComponent } from "../../../../shared/components/nao-badge/nao-badge.component";
import { NaoTooltipComponent, TooltipMenuItem } from "../../../../shared/components/nao-tooltip/nao-tooltip.component";
 
class WorkOrderBarMenuManager { 
  readonly openBarId = signal<string | null>(null);

  setOpen(barId: string): void {
    this.openBarId.set(barId);
  }

  setClosed(barId: string): void {
    if (this.openBarId() === barId) {
      this.openBarId.set(null);
    }
  }

  isOpen(barId: string): boolean {
    return this.openBarId() === barId;
  }

  hasAnyOpen(): boolean {
    return this.openBarId() !== null;
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
  isHovered = false;

  // Computed z-index based on whether this bar's menu is open or hovered
  get zIndex(): string {
    const openBarId = menuManager.openBarId(); // Read signal to track changes
    const hasOpenMenu = openBarId === this.workOrder.docId;
    const otherMenuOpen = openBarId !== null && !hasOpenMenu;
    
    if (hasOpenMenu) {
      return "100"; // Active menu bar on top
    }
    if (otherMenuOpen) {
      return "8"; // Other bars below active menu but still above cells (z-index 5)
    }
    if (this.isHovered) {
      return "20"; // Hovered bar above default
    }
    return "10"; // Default z-index above hovered cells (z-index 5)
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

  onMouseEnter(): void {
    this.isHovered = true;
  }

  onMouseLeave(): void {
    this.isHovered = false;
  }

  onContainerMouseLeave(): void { 
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      menuManager.setClosed(this.workOrder.docId);
    }
  }
}
