import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCollectionComponent } from './new-collection.component';

describe('NewCollectionComponent', () => {
  let component: NewCollectionComponent;
  let fixture: ComponentFixture<NewCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
