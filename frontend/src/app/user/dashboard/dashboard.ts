import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Progress, UserMediaProgressOut } from '../../Services/progress';
import { Media, MediaOut } from '../../Services/media';
import { MediaCard } from '../../shared/media-card/media-card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MediaCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly progressService = inject(Progress);
  private readonly mediaService = inject(Media);
  private readonly router = inject(Router);

  loading = signal(true);
  stats = signal({ completed: 0, active: 0, planned: 0 });
  
  activeItems = signal<{progress: UserMediaProgressOut, media: MediaOut}[]>([]);
  plannedItems = signal<{progress: UserMediaProgressOut, media: MediaOut}[]>([]);
  completedItems = signal<{progress: UserMediaProgressOut, media: MediaOut}[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      const [progress, mediaPage, statuses] = await Promise.all([
        this.progressService.listMine(),
        this.mediaService.list(1, 100), // Fetch first 100 media items for now
        this.progressService.listStatuses()
      ]);

      const mediaMap = new Map(mediaPage.items.map(m => [m.id, m]));
      const statusMap = new Map(statuses.map(s => [s.id, s]));

      const enriched = progress.map(p => ({
        progress: p,
        media: mediaMap.get(p.media_id)!,
        status: statusMap.get(p.status_id)
      })).filter(item => item.media);

      // Segment by status category
      this.activeItems.set(enriched.filter(i => i.status?.category === 'active'));
      this.plannedItems.set(enriched.filter(i => i.status?.category === 'todo'));
      this.completedItems.set(enriched.filter(i => i.status?.category === 'done').slice(0, 5));

      // Calculate stats
      this.stats.set({
        completed: enriched.filter(i => i.status?.category === 'done').length,
        active: enriched.filter(i => i.status?.category === 'active').length,
        planned: enriched.filter(i => i.status?.category === 'todo').length,
      });

    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      this.loading.set(false);
    }
  }

  viewDetails(id: number) {
    this.router.navigate(['/user/media', id]);
  }
}
