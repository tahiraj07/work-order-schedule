import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NaoInputComponent } from "./nao-input.component";

describe("NaoInputComponent", () => {
  let component: NaoInputComponent;
  let fixture: ComponentFixture<NaoInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NaoInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NaoInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
