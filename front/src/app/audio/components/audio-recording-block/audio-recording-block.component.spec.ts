import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioRecordingBlockComponent } from './audio-recording-block.component';

describe('AudioRecordingBlockComponent', () => {
  let component: AudioRecordingBlockComponent;
  let fixture: ComponentFixture<AudioRecordingBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioRecordingBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioRecordingBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

