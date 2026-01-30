import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderFormPanelComponent } from './work-order-form-panel.component';

describe('WorkOrderFormPanelComponent', () => {
  let component: WorkOrderFormPanelComponent;
  let fixture: ComponentFixture<WorkOrderFormPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkOrderFormPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkOrderFormPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
