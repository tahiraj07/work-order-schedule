import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-nao-button",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./nao-button.component.html",
  styleUrl: "./nao-button.component.scss",
})
export class NaoButtonComponent {
  @Input() type: "primary" | "secondary" = "primary";
  @Input() disabled = false;
}
