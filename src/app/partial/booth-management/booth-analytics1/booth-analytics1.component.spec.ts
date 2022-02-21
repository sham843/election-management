import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoothAnalytics1Component } from './booth-analytics1.component';

describe('BoothAnalytics1Component', () => {
  let component: BoothAnalytics1Component;
  let fixture: ComponentFixture<BoothAnalytics1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoothAnalytics1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoothAnalytics1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
