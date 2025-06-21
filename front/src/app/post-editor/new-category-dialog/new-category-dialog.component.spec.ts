import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCategoryDialogComponent } from './new-category-dialog.component';

describe('NewCategoryDialogComponent', () => {
  let component: NewCategoryDialogComponent;
  let fixture: ComponentFixture<NewCategoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewCategoryDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCategoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
