import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tech-filter',
  imports: [CommonModule],
  templateUrl: './tech-filter.component.html',
  styleUrl: './tech-filter.component.css',
  standalone: true
})
export class TechFilterComponent {
  @Input() techList: { name: string; image: string }[] = [];
  @Output() filterCourses = new EventEmitter<string>();

  // Duplicate techList for seamless looping
  get duplicatedTechList(): { name: string; image: string }[] {
    return [...this.techList, ...this.techList];
  }

  selectTechnology(tech: string): void {
    this.filterCourses.emit(tech);
  }
}