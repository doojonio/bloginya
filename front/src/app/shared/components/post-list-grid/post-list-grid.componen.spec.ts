import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostListGridComponent } from './post-list-grid.componen';

describe('PopularPostsComponent', () => {
  let component: PostListGridComponent;
  let fixture: ComponentFixture<PostListGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostListGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostListGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
