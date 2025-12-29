import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioWaveVisualizerComponent } from './audio-wave-visualizer.component';

describe('AudioWaveVisualizerComponent', () => {
  let component: AudioWaveVisualizerComponent;
  let fixture: ComponentFixture<AudioWaveVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioWaveVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioWaveVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

