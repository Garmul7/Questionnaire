import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostQuestionComponent } from './host-question.component';

describe('HostQuestionComponent', () => {
  let component: HostQuestionComponent;
  let fixture: ComponentFixture<HostQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HostQuestionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
