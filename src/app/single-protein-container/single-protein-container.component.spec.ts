import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleProteinContainerComponent } from './single-protein-container.component';

describe('SingleProteinContainerComponent', () => {
  let component: SingleProteinContainerComponent;
  let fixture: ComponentFixture<SingleProteinContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleProteinContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SingleProteinContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
