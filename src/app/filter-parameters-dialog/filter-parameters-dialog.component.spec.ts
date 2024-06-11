import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterParametersDialogComponent } from './filter-parameters-dialog.component';

describe('FilterParametersDialogComponent', () => {
  let component: FilterParametersDialogComponent;
  let fixture: ComponentFixture<FilterParametersDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterParametersDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterParametersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
