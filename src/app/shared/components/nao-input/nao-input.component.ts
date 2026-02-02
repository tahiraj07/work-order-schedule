import { Component, Input, forwardRef, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from "@angular/forms";

@Component({
  selector: "app-nao-input",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./nao-input.component.html",
  styleUrl: "./nao-input.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NaoInputComponent),
      multi: true,
    },
  ],
})
export class NaoInputComponent implements ControlValueAccessor {
  @Input() id = `nao-input-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label?: string;
  @Input() type: string = "text";
  @Input() placeholder = "";
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() errorMessage?: string;
  @Input() hint?: string;

  // For datepicker integration
  @Input() datepicker?: any;  
  @Input() showDatepickerIcon = false;

  // Internal state
  value = signal<string>("");
  isFocused = signal(false);

  // ControlValueAccessor callbacks
  private onChange = (value: string) => {};
  private onTouched = () => {};

  // Computed values
  hasError = computed(() => !!this.errorMessage);
  showLabel = computed(() => !!this.label);

  /**
   * Handle input value changes
   */
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    this.value.set(newValue);
    this.onChange(newValue);
  }

  /**
   * Handle focus event
   */
  onFocus(): void {
    this.isFocused.set(true);
  }

  /**
   * Handle blur event
   */
  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  /**
   * Handle datepicker icon click
   * Emits event to parent component to handle toggle
   */
  onDatepickerClick(): void {
    if (!this.disabled && this.datepicker) {
      // Let parent component handle the toggle 
    }
  }

  /**
   * ControlValueAccessor: Write value from form
   */
  writeValue(value: string): void {
    this.value.set(value || "");
  }

  /**
   * ControlValueAccessor: Register change callback
   */
  registerOnChange(fn: (value: string) => void): void {
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
