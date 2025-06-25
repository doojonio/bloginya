import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyViewComponent } from './reply-view.component';

describe('ReplyViewComponent', () => {
  let component: ReplyViewComponent;
  let fixture: ComponentFixture<ReplyViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplyViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
