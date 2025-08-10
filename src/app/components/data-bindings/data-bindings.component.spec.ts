import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataBindingsComponent } from './data-bindings.component';

describe('DataBindingsComponent', () => {
  let component: DataBindingsComponent;
  let fixture: ComponentFixture<DataBindingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataBindingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataBindingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
