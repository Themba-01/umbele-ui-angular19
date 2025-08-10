import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataBindingsLatestComponent } from './data-bindings-latest.component';

describe('DataBindingsLatestComponent', () => {
  let component: DataBindingsLatestComponent;
  let fixture: ComponentFixture<DataBindingsLatestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataBindingsLatestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataBindingsLatestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
