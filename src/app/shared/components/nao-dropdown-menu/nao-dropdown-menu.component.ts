import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownMenuItem {
  label: string;
  value: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-nao-dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nao-dropdown-menu.component.html',
  styleUrl: './nao-dropdown-menu.component.scss'
})
export class NaoDropdownMenuComponent {
  @Input() items: DropdownMenuItem[] = [];
  @Input() ariaLabel = 'Actions menu';
  @Output() itemSelected = new EventEmitter<DropdownMenuItem>();

  isOpen = false;

  toggle(event: Event): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    console.log('Toggle clicked! isOpen:', this.isOpen, 'items:', this.items);
  }

  selectItem(item: DropdownMenuItem, event: Event): void {
    event.stopPropagation();
    if (!item.disabled) {
      this.itemSelected.emit(item);
      this.isOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.isOpen) return;
    
    const target = event.target as HTMLElement;
    if (!target.closest('app-nao-dropdown-menu')) {
      this.isOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen = false;
  }
}
