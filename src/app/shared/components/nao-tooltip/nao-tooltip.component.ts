import { Component, Input, Output, EventEmitter, HostListener, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface TooltipMenuItem {
  label: string;
  value: string;
  disabled?: boolean;
}

// Simple service to manage tooltip state globally (for click-triggered menus)
class TooltipManager {
  private openTooltip: NaoTooltipComponent | null = null;

  setOpen(tooltip: NaoTooltipComponent): void {
    if (this.openTooltip && this.openTooltip !== tooltip) {
      this.openTooltip.close();
    }
    this.openTooltip = tooltip;
  }

  setClosed(tooltip: NaoTooltipComponent): void {
    if (this.openTooltip === tooltip) {
      this.openTooltip = null;
    }
  }
}

const tooltipManager = new TooltipManager();

@Component({
  selector: "app-nao-tooltip",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./nao-tooltip.component.html",
  styleUrl: "./nao-tooltip.component.scss",
})
export class NaoTooltipComponent implements OnChanges {
  @Input() text = "";
  @Input() position: "top" | "bottom" | "left" | "right" = "top";
  @Input() trigger: "hover" | "click" = "hover";
  @Input() items: TooltipMenuItem[] = [];
  @Input() isOpen = false;
  @Output() itemSelected = new EventEmitter<TooltipMenuItem>();
  @Output() closed = new EventEmitter<void>();

  private ignoreNextClick = false;
  private lastOpenState = false;

  get showAsMenu(): boolean {
    return this.items.length > 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      // When opening, ignore the next click outside check
      if (this.isOpen && !this.lastOpenState) {
        // Only manage state for click-triggered menus
        if (this.trigger === "click" && this.showAsMenu) {
          tooltipManager.setOpen(this);
        }
        this.ignoreNextClick = true;
        setTimeout(() => {
          this.ignoreNextClick = false;
        }, 100);
      } else if (!this.isOpen && this.lastOpenState) {
        // When closing, notify manager
        if (this.trigger === "click" && this.showAsMenu) {
          tooltipManager.setClosed(this);
        }
      }
      this.lastOpenState = this.isOpen;
    }
  }

  close(): void {
    if (this.trigger === "click" && this.showAsMenu) {
      tooltipManager.setClosed(this);
    }
    this.closed.emit();
  }

  onItemClick(item: TooltipMenuItem, event: MouseEvent): void {
    event.stopPropagation();
    if (!item.disabled) {
      this.itemSelected.emit(item);
      this.closed.emit();
    }
  }

  @HostListener("document:click", ["$event"])
  onClickOutside(event: MouseEvent): void {
    if (this.trigger === "click" && this.isOpen && !this.ignoreNextClick) {
      const target = event.target as HTMLElement;
      if (!target.closest(".tooltip-wrapper")) {
        this.closed.emit();
      }
    }
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    if (this.trigger === "click" && this.isOpen) {
      this.closed.emit();
    }
  }
}
