import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBoothwiseVotersList1Component } from './view-boothwise-voters-list1.component';

describe('ViewBoothwiseVotersList1Component', () => {
  let component: ViewBoothwiseVotersList1Component;
  let fixture: ComponentFixture<ViewBoothwiseVotersList1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewBoothwiseVotersList1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBoothwiseVotersList1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
