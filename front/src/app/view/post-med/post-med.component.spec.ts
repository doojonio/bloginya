import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostMedComponent } from './post-med.component';

describe('PostMedComponent', () => {
  let component: PostMedComponent;
  let fixture: ComponentFixture<PostMedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostMedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostMedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
