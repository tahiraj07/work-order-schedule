import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkOrderDocument, WorkOrderStatus } from "../../../../core/models/work-order.model";
import { NaoBadgeComponent } from "../../../../shared/components/nao-badge/nao-badge.component";
import { NaoDropdownMenuComponent, DropdownMenuItem } from "../../../../shared/components/nao-dropdown-menu/nao-dropdown-menu.component";
import { NaoTooltipComponent } from "../../../../shared/components/nao-tooltip/nao-tooltip.component";

@Component({
  selector: "app-work-order-bar",
  standalone: true,
  imports: [
    CommonModule,
    NaoBadgeComponent,
    NaoDropdownMenuComponent,
    NaoTooltipComponent,
  ],
  templateUrl: "./work-order-bar.component.html",
  styleUrl: "./work-order-bar.component.scss",
})
export class WorkOrderBarComponent {
  @Input() workOrder!: WorkOrderDocument;
  @Input() left: number = 0; // Position from left in pixels (hardcoded for now)
  @Input() width: number = 200; // Width in pixels (hardcoded for now)

  dropdownMenuItems: DropdownMenuItem[] = [
    { label: "Edit", value: "edit" },
    { label: "Delete", value: "delete" },
  ];

  onMenuItemSelected(item: DropdownMenuItem): void {
    console.log("Menu item selected:", item, "for work order:", this.workOrder.docId);
    // TODO: Emit events for edit/delete actions
  }

  getTooltipText(): string {
    return `${this.workOrder.data.name}\n${this.workOrder.data.status}\n${this.workOrder.data.startDate} - ${this.workOrder.data.endDate}`;
  }
}
