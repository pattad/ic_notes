import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewboardComponent } from './newboard.component';

describe('NewboardComponent', () => {
  let component: NewboardComponent;
  let fixture: ComponentFixture<NewboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
