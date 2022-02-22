import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireCreationComponent } from './questionnaire-creation.component';

describe('QuestionnaireCreationComponent', () => {
  let component: QuestionnaireCreationComponent;
  let fixture: ComponentFixture<QuestionnaireCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionnaireCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
