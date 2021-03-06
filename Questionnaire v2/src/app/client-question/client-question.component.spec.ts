import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientQuestionComponent } from './client-question.component';

describe('ClientQuestionComponent', () => {
  let component: ClientQuestionComponent;
  let fixture: ComponentFixture<ClientQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientQuestionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
