import { Injectable } from '@angular/core';

export interface Video {
  title: string;
  description: string | null;
  videoId: string;
  videoUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  getVideos(filter: string = ''): Video[] {
    if (!filter.trim()) {
      return this.videos;
    }
    const lowerCaseFilter = filter.toLowerCase();
    return this.videos.filter((video) =>
      video.title.toLowerCase().includes(lowerCaseFilter)
    );
  }

  private videos = [
    {
      title: 'Grade 10 Algebra: Introduction to Quadratic Equations',
      description: 'Learn how to solve quadratic equations, a core topic in the Grade 10 CAPS Mathematics syllabus.',
      videoId: 'tGAURuspAGI', 
      videoUrl: 'https://www.youtube.com/watch?v=tGAURuspAGI',
    },
    {
      title: 'Grade 11 Physics: Newton’s Laws of Motion Explained',
      description: 'Understand Newton’s Laws of Motion with practical examples, aligned with the Grade 11 CAPS Physics syllabus.',
      videoId: '7YhkjSlxsrc', 
      videoUrl: 'https://www.youtube.com/watch?v=7YhkjSlxsrc',
    },
    {
      title: 'Grade 12 Life Sciences: DNA Replication and Protein Synthesis',
      description: 'Explore DNA replication and protein synthesis, key topics in the Grade 12 CAPS Life Sciences syllabus.',
      videoId: '3Q94vl9CEdk', 
      videoUrl: 'https://www.youtube.com/watch?v=3Q94vl9CEdk',
    },
    {
      title: 'Grade 12 Accounting: Financial Statements Basics',
      description: 'Learn how to prepare and analyze financial statements, a fundamental part of the Grade 12 CAPS Accounting syllabus.',
      videoId: 'oSKeGAVSDNM', 
      videoUrl: 'https://www.youtube.com/watch?v=oSKeGAVSDNM',
    },
  ];
}