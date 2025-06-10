import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangPostsComponent } from './lang-posts.component';

describe('LangPostsComponent', () => {
  let component: LangPostsComponent;
  let fixture: ComponentFixture<LangPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LangPostsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LangPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
