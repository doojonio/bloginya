import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogPublisherComponent } from './blog-publisher.component';

describe('BlogPublisherComponent', () => {
  let component: BlogPublisherComponent;
  let fixture: ComponentFixture<BlogPublisherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPublisherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogPublisherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
