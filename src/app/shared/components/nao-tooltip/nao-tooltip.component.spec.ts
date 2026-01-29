import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NaoTooltipComponent } from "./nao-tooltip.component";

describe("NaoTooltipComponent", () => {
  let component: NaoTooltipComponent;
  let fixture: ComponentFixture<NaoTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NaoTooltipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NaoTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
