import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateQuestionChoiceComponent } from './create-question-choice.component';

describe('CreateQuestionChoiceComponent', () => {
  let component: CreateQuestionChoiceComponent;
  let fixture: ComponentFixture<CreateQuestionChoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateQuestionChoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateQuestionChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
