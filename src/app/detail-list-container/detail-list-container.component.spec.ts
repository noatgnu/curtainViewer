import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailListContainerComponent } from './detail-list-container.component';

describe('DetailListContainerComponent', () => {
  let component: DetailListContainerComponent;
  let fixture: ComponentFixture<DetailListContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailListContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailListContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
