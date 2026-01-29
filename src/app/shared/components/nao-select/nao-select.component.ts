import { Component, Input, forwardRef, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { NaoBadgeComponent } from "../nao-badge/nao-badge.component";
import { WorkOrderStatus } from "../../../core/models/work-order.model";

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: "app-nao-select",
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, NaoBadgeComponent],
  templateUrl: "./nao-select.component.html",
  styleUrl: "./nao-select.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NaoSelectComponent),
      multi: true,
    },
  ],
})
export class NaoSelectComponent implements ControlValueAccessor {
  @Input() id = `nao-select-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label?: string;
  @Input() placeholder = "Select...";
  @Input() required = false;
  @Input() disabled = false;
  @Input() errorMessage?: string;
  @Input() hint?: string;
  @Input() variant: "default" | "status" = "default";
  @Input() items: SelectOption[] = [];

  // Internal state
  selectedValue = signal<string | null>(null);
  isFocused = signal(false);

  // ControlValueAccessor callbacks
  private onChange = (value: string | null) => {};
  private onTouched = () => {};

  // Computed values
  hasError = computed(() => !!this.errorMessage);
  showLabel = computed(() => !!this.label);
  isStatusVariant = computed(() => this.variant === "status");

  /**
   * Check if status input field should show focus state
   */
  isStatusFocused = computed(() => this.isFocused() && this.variant === "status");

  /**
   * Get selected option
   */
  getSelectedOption(): SelectOption | null {
    if (!this.selectedValue()) return null;
    return this.items.find((item) => item.value === this.selectedValue()) || null;
  }

  /**
   * Get selected label for display
   */
  getSelectedLabel(): string {
    const option = this.getSelectedOption();
    return option ? option.label : "";
  }

  /**
   * Get status value for badge (only for status variant)
   */
  getStatusValue(): WorkOrderStatus {
    return this.selectedValue() as WorkOrderStatus;
  }

  /**
   * Handle selection change
   */
  onSelectionChange(value: string | null): void {
    this.selectedValue.set(value);
    this.onChange(value);
    this.onTouched();
  }

  /**
   * Handle focus
   */
  onFocus(): void {
    this.isFocused.set(true);
  }

  /**
   * Handle blur
   */
  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  /**
   * ControlValueAccessor: Write value from form
   */
  writeValue(value: string | null): void {
    this.selectedValue.set(value || null);
  }

  /**
   * ControlValueAccessor: Register change callback
   */
  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  /**
   * ControlValueAccessor: Register touched callback
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * ControlValueAccessor: Set disabled state
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
