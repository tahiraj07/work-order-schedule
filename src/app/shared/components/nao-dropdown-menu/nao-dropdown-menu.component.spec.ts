import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NaoDropdownMenuComponent } from "./nao-dropdown-menu.component";

describe("NaoDropdownMenuComponent", () => {
  let component: NaoDropdownMenuComponent;
  let fixture: ComponentFixture<NaoDropdownMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NaoDropdownMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NaoDropdownMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
