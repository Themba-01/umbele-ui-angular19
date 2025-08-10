import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechFilterComponent } from './tech-filter.component';

describe('TechFilterComponent', () => {
  let component: TechFilterComponent;
  let fixture: ComponentFixture<TechFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
