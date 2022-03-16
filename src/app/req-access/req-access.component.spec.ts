import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReqAccessComponent } from './req-access.component';

describe('ReqAccessComponent', () => {
  let component: ReqAccessComponent;
  let fixture: ComponentFixture<ReqAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReqAccessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReqAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
