import { Component, Input, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkOrderStatus } from "../../../core/models/work-order.model";

@Component({
  selector: "app-nao-badge",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./nao-badge.component.html",
  styleUrl: "./nao-badge.component.scss",
})
export class NaoBadgeComponent {
  @Input() status!: WorkOrderStatus;

  statusClass = computed(() => `status-${this.status}`);

  getStatusLabel(): string {
    const labels: Record<WorkOrderStatus, string> = {
      open: "Open",
      "in-progress": "In Progress",
      complete: "Complete",
      blocked: "Blocked",
    };
    return labels[this.status] || this.status;
  }
}
