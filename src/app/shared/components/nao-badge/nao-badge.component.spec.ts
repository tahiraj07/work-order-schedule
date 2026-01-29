import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NaoBadgeComponent } from "./nao-badge.component";

describe("NaoBadgeComponent", () => {
  let component: NaoBadgeComponent;
  let fixture: ComponentFixture<NaoBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NaoBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NaoBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
