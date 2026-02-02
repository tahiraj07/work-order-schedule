import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnInit,
  HostListener,
  signal,
  effect,
  WritableSignal,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { NaoInputComponent } from "../../../../shared/components/nao-input/nao-input.component";
import { NaoDatepickerComponent } from "../../../../shared/components/nao-datepicker/nao-datepicker.component";
import { NaoSelectComponent, SelectOption } from "../../../../shared/components/nao-select/nao-select.component";
import { NaoButtonComponent } from "../../../../shared/components/nao-button/nao-button.component";
import {
  WorkOrderDocument, 
  WorkOrderFormMode,
} from "../../../../core/models/work-order.model";
import { WorkOrderService } from "../../../../core/services/work-order.service";
import { TimelineService } from "../../../../core/services/timeline.service"; 

@Component({
  selector: "app-work-order-form-panel",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NaoInputComponent,
    NaoDatepickerComponent,
    NaoSelectComponent,
    NaoButtonComponent,
  ],
  templateUrl: "./work-order-form-panel.component.html",
  styleUrl: "./work-order-form-panel.component.scss",
})
export class WorkOrderFormPanelComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private workOrderService = inject(WorkOrderService);
  private timelineService = inject(TimelineService);

  @Input() isOpen!: WritableSignal<boolean>;
  @Input() mode: WorkOrderFormMode = "create";
  @Input() workOrder?: WorkOrderDocument;
  @Input() initialStartDate?: Date;
  @Input() initialWorkCenterId?: string;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<WorkOrderDocument>();

  @ViewChild("firstInput", { static: false }) firstInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild("panelContainer", { static: false }) panelContainerRef?: ElementRef<HTMLDivElement>;

  form!: FormGroup;
  isSubmitting = signal(false);

  // Work center options
  workCenterOptions: SelectOption[] = [];

  // Status options
  statusOptions: SelectOption[] = [
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In Progress" },
    { value: "complete", label: "Complete" },
    { value: "blocked", label: "Blocked" },
  ];

  constructor() { 
    effect(() => {
      if (this.isOpen()) {
        setTimeout(() => {
          this.initForm(); 
          setTimeout(() => {
            if (this.firstInputRef) {
              this.focusFirstInput();
            }
          }, 200);
        }, 0);
      }
    });
  }

  ngAfterViewInit(): void {
    // Focus management when panel opens - check if already open
    if (this.isOpen() && this.firstInputRef) {
      setTimeout(() => {
        this.focusFirstInput();
      }, 150);
    }
  }

  private focusFirstInput(): void {
    if (this.firstInputRef?.nativeElement) {
      this.firstInputRef.nativeElement.focus();
    }
  }

  ngOnInit(): void {
    // Load work centers
    this.workCenterOptions = this.workOrderService.getWorkCenters().map((wc) => ({
      value: wc.docId,
      label: wc.data.name,
    }));

    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group(
      {
        name: ["", [Validators.required]],
        workCenterId: ["", [Validators.required]],
        status: ["open", [Validators.required]],
        startDate: ["", [Validators.required]],
        endDate: ["", [Validators.required]],
      },
      { validators: [this.dateRangeValidator, this.overlapValidator.bind(this)] }
    );

    // Populate form based on mode
    if (this.mode === "edit" && this.workOrder) {
      this.populateEditForm();
    } else {
      this.populateCreateForm();
    }
  }

  private populateCreateForm(): void {
    const startDate = this.initialStartDate || new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);  

    this.form.patchValue({
      name: "",
      workCenterId: this.initialWorkCenterId || "",
      status: "open",
      startDate: this.dateToIsoString(startDate),
      endDate: this.dateToIsoString(endDate),
    });
  }

  private populateEditForm(): void {
    if (!this.workOrder) return;

    this.form.patchValue({
      name: this.workOrder.data.name,
      workCenterId: this.workOrder.data.workCenterId,
      status: this.workOrder.data.status,
      startDate: this.workOrder.data.startDate,
      endDate: this.workOrder.data.endDate,
    });
  }

  // Custom validators
  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get("startDate")?.value;
    const endDate = control.get("endDate")?.value;

    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return { dateRangeInvalid: true };
    }

    return null;
  }

  private overlapValidator(control: AbstractControl): ValidationErrors | null {
    const workCenterId = control.get("workCenterId")?.value;
    const startDate = control.get("startDate")?.value;
    const endDate = control.get("endDate")?.value;

    if (!workCenterId || !startDate || !endDate) return null;

    const testOrder: Partial<WorkOrderDocument> = {
      data: {
        workCenterId,
        startDate,
        endDate,
        name: "",
        status: "open",
      },
    };

    const excludeId = this.mode === "edit" && this.workOrder ? this.workOrder.docId : undefined;
    const allOrders = this.workOrderService.getWorkOrders();

    if (
      this.timelineService.checkOverlap(
        testOrder as any,
        allOrders,
        excludeId
      )
    ) {
      return { overlap: true };
    }

    return null;
  }

  // Helper methods
  private dateToIsoString(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  // Event handlers
  onClose(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.form.value;

    if (this.mode === "create") {
      const result = this.workOrderService.createWorkOrder({
        data: {
          name: formValue.name,
          workCenterId: formValue.workCenterId,
          status: formValue.status,
          startDate: formValue.startDate,
          endDate: formValue.endDate,
        },
      });

      if (result.success) {
        this.onClose();
        this.saved.emit(this.workOrderService.getWorkOrders().slice(-1)[0]);
      } else { 
        console.error(result.error);
        alert(result.error);
      }
    } else { 
      if (!this.workOrder) return;

      const result = this.workOrderService.updateWorkOrder(this.workOrder.docId, {
        name: formValue.name,
        workCenterId: formValue.workCenterId,
        status: formValue.status,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
      });

      if (result.success) {
        this.onClose();
        const updated = this.workOrderService.getWorkOrderById(this.workOrder.docId);
        if (updated) {
          this.saved.emit(updated);
        }
      } else {
        console.error(result.error);
        alert(result.error);
      }
    }

    this.isSubmitting.set(false);
  }

  // Close on Escape key
  @HostListener("document:keydown.escape", ["$event"])
  onEscapeKey(event: any): void {
    if (this.isOpen()) {
      event.preventDefault();
      this.onClose();
    }
  }

  // Get error messages
  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors["required"]) {
        return "This field is required";
      }
    }
    return "";
  }

  getFormError(): string {
    if (this.form.errors?.["dateRangeInvalid"]) {
      return "End date must be after start date";
    }
    if (this.form.errors?.["overlap"]) {
      return "This work order overlaps with an existing order on the same work center";
    }
    return "";
  }

  getButtonText(): string {
    return this.mode === "create" ? "Create" : "Save";
  }
}
