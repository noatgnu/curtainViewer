import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkLabelDialogComponent } from './link-label-dialog.component';

describe('LinkLabelDialogComponent', () => {
  let component: LinkLabelDialogComponent;
  let fixture: ComponentFixture<LinkLabelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkLabelDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LinkLabelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
