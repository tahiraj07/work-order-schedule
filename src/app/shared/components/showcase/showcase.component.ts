import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from "@angular/forms";
import { NaoInputComponent } from "../nao-input/nao-input.component";
import { NaoDatepickerComponent } from "../nao-datepicker/nao-datepicker.component";
import { NaoButtonComponent } from "../nao-button/nao-button.component";
import { NaoBadgeComponent } from "../nao-badge/nao-badge.component";
import { NaoSelectComponent, SelectOption } from "../nao-select/nao-select.component";
import { NaoTooltipComponent, TooltipMenuItem } from "../nao-tooltip/nao-tooltip.component";
import { WorkOrderStatus, TimelineZoomLevel } from "../../../core/models/work-order.model";

/**
 * Component Showcase
 * Temporary component to display all shared components with examples
 * Use this to test and see all components in one place
 */
@Component({
  selector: "app-showcase",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NaoInputComponent,
    NaoDatepickerComponent,
    NaoButtonComponent,
    NaoBadgeComponent,
    NaoSelectComponent,
    NaoTooltipComponent,
  ],
  templateUrl: "./showcase.component.html",
  styleUrl: "./showcase.component.scss",
})
export class ShowcaseComponent {
  // Form for testing
  form = this.fb.group({
    textInput: ["", Validators.required],
    emailInput: ["", [Validators.required, Validators.email]],
    dateInput: ["", Validators.required],
    endDateInput: ["", Validators.required],
  });

  // Standalone values for testing
  standaloneText = signal("");
  standaloneDate = signal<string | null>(null);
  disabledValue = signal("Disabled value");
  readonlyValue = signal("Readonly value");

  // Status examples
  statuses: WorkOrderStatus[] = ["open", "in-progress", "complete", "blocked"];

  // Select options
  timescaleOptions: SelectOption[] = [
    { value: "hour", label: "Hour" },
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ];

  statusOptions: SelectOption[] = [
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In Progress" },
    { value: "complete", label: "Complete" },
    { value: "blocked", label: "Blocked" },
  ];

  selectedTimescale = signal<string | null>("month");
  selectedStatus = signal<string | null>("open");

  dropdownMenuItems: TooltipMenuItem[] = [
    { label: "Edit", value: "edit" },
    { label: "Delete", value: "delete" },
  ];

  selectedMenuItem = signal<TooltipMenuItem | null>(null);
  isDropdownOpen = signal(false);

  onMenuItemSelected(item: TooltipMenuItem): void {
    this.selectedMenuItem.set(item);
    console.log("Menu item selected:", item);
    alert(`Selected: ${item.label} (${item.value})`);
    this.isDropdownOpen.set(false);
  }

  onDropdownClosed(): void {
    this.isDropdownOpen.set(false);
  }


  constructor(private fb: FormBuilder) {}

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors["required"]) {
        return "This field is required";
      }
      if (field.errors["email"]) {
        return "Please enter a valid email";
      }
    }
    return "";
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log("Form submitted:", this.form.value);
      alert("Form is valid! Check console for values.");
    } else {
      this.form.markAllAsTouched();
      alert("Please fix form errors");
    }
  }

  onStandaloneDateChange(value: string | null): void {
    this.standaloneDate.set(value);
    console.log("Standalone date changed:", value);
  }
}
