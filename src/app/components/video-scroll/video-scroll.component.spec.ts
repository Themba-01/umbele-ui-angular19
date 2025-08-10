import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoScrollComponent } from './video-scroll.component';

describe('VideoScrollComponent', () => {
  let component: VideoScrollComponent;
  let fixture: ComponentFixture<VideoScrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoScrollComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
