import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawDataBarChartComponent } from './raw-data-bar-chart.component';

describe('RawDataBarChartComponent', () => {
  let component: RawDataBarChartComponent;
  let fixture: ComponentFixture<RawDataBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RawDataBarChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RawDataBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
