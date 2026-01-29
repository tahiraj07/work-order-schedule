import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NaoButtonComponent } from "./nao-button.component";

describe("NaoButtonComponent", () => {
  let component: NaoButtonComponent;
  let fixture: ComponentFixture<NaoButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NaoButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NaoButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
