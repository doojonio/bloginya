import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostListMedComponent } from './post-list-med.component';

describe('PostListMedComponent', () => {
  let component: PostListMedComponent;
  let fixture: ComponentFixture<PostListMedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostListMedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostListMedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
