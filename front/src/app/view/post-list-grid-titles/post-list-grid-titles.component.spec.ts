import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostListGridTitlesComponent } from './post-list-grid-titles.component';

describe('PostListGridTitlesComponent', () => {
  let component: PostListGridTitlesComponent;
  let fixture: ComponentFixture<PostListGridTitlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostListGridTitlesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostListGridTitlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
