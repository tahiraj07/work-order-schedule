import {
  Component,
  Input,
  forwardRef,
  signal,
  ViewChild,
  HostListener,
  AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from "@angular/forms";
import { NgbDatepickerModule, NgbDateStruct, NgbDatepicker } from "@ng-bootstrap/ng-bootstrap";
import { NaoInputComponent } from "../nao-input/nao-input.component";

/**
 * Datepicker Wrapper Component
 * Wraps ngb-datepicker with our custom input styling
 * Provides consistent design and better separation of concerns
 *
 * Why separate component?
 * - Better separation: Input handles text, Datepicker handles dates
 * - Cleaner API: Datepicker-specific logic isolated
 * - Easier to maintain: Changes to datepicker don't affect text input
 * - Reusable: Can be used anywhere dates are needed
 */
@Component({
  selector: "app-nao-datepicker",
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDatepickerModule, NaoInputComponent],
  templateUrl: "./nao-datepicker.component.html",
  styleUrl: "./nao-datepicker.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NaoDatepickerComponent),
      multi: true,
    },
  ],
})
export class NaoDatepickerComponent implements ControlValueAccessor, AfterViewInit {
  @Input() id = `nao-datepicker-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label?: string;
  @Input() placeholder = "Select date";
  @Input() required = false;
  @Input() disabled = false;
  @Input() errorMessage?: string;
  @Input() hint?: string;
  @Input() minDate?: NgbDateStruct;
  @Input() maxDate?: NgbDateStruct;

  @ViewChild("datepicker") datepicker!: NgbDatepicker;
  @ViewChild(NaoInputComponent) inputComponent!: NaoInputComponent;

  // Internal state
  dateValue = signal<NgbDateStruct | null>(null);
  showDatepicker = signal(false);

  // ControlValueAccessor callbacks
  private onChange = (value: string | null) => {};
  private onTouched = () => {};

  /**
   * Format NgbDateStruct to display string
   */
  getDisplayValue(): string {
    const date = this.dateValue();
    if (!date) return "";

    const jsDate = new Date(date.year, date.month - 1, date.day);
    return jsDate
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, ".");
  }

  /**
   * Handle date selection from datepicker
   */
  onDateSelect(date: NgbDateStruct): void {
    this.dateValue.set(date);
    const isoDate = this.ngbDateToIso(date);
    this.onChange(isoDate);
    this.onTouched();
    this.showDatepicker.set(false);
  }

  ngAfterViewInit(): void {
    // Set up datepicker reference after view init
    if (this.inputComponent && this.datepicker) {
      this.inputComponent.datepicker = this.datepicker;
    }
  }

  /**
   * Toggle datepicker visibility
   */
  toggleDatepicker(): void {
    if (!this.disabled) {
      this.showDatepicker.set(!this.showDatepicker());
    }
  }

  /**
   * Get minDate for datepicker (only bind if exists)
   */
  getMinDate(): NgbDateStruct {
    return this.minDate!;
  }

  /**
   * Get maxDate for datepicker (only bind if exists)
   */
  getMaxDate(): NgbDateStruct {
    return this.maxDate!;
  }

  /**
   * Close datepicker when clicking outside
   */
  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest(".nao-datepicker-wrapper")) {
      this.showDatepicker.set(false);
    }
  }

  /**
   * Convert NgbDateStruct to ISO string
   */
  private ngbDateToIso(date: NgbDateStruct | null): string | null {
    if (!date) return null;
    const jsDate = new Date(date.year, date.month - 1, date.day);
    return jsDate.toISOString().split("T")[0];
  }

  /**
   * Convert ISO string to NgbDateStruct
   */
  private isoToNgbDate(isoDate: string | null): NgbDateStruct | null {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }

  /**
   * ControlValueAccessor: Write value from form
   */
  writeValue(value: string | null): void {
    if (value) {
      const ngbDate = this.isoToNgbDate(value);
      this.dateValue.set(ngbDate);
    } else {
      this.dateValue.set(null);
    }
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

  /**
   * Handle input click
   */
  onInputClick(): void {
    this.toggleDatepicker();
    this.onTouched();
  }
}
