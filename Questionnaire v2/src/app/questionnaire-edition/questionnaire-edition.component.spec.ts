import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireEditionComponent } from './questionnaire-edition.component';

describe('QuestionnaireEditionComponent', () => {
  let component: QuestionnaireEditionComponent;
  let fixture: ComponentFixture<QuestionnaireEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionnaireEditionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
