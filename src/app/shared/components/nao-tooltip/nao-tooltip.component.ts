import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-nao-tooltip",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./nao-tooltip.component.html",
  styleUrl: "./nao-tooltip.component.scss",
})
export class NaoTooltipComponent {
  @Input() text = "";
  @Input() position: "top" | "bottom" | "left" | "right" = "top";
}
