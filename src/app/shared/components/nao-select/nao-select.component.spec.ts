import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NaoSelectComponent } from './nao-select.component';

describe('NaoSelectComponent', () => {
  let component: NaoSelectComponent;
  let fixture: ComponentFixture<NaoSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NaoSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NaoSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
