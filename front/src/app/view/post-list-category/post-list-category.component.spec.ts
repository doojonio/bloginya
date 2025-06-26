import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostListCategoryComponent } from './post-list-category.component';

describe('LangPostsComponent', () => {
  let component: PostListCategoryComponent;
  let fixture: ComponentFixture<PostListCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostListCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostListCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
