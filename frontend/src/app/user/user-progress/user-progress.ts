import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Progress, UserMediaProgressOut } from '../../Services/progress';
import { Media, MediaOut } from '../../Services/media';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-progress.html',
  styleUrl: './user-progress.css',
})
export class UserProgress implements OnInit {
  private readonly progressService = inject(Progress);
  private readonly mediaService = inject(Media);
  private readonly router = inject(Router);

  loading = signal(true);
  columns = signal<{status: any, items: {progress: UserMediaProgressOut, media: MediaOut}[]}[]>([]);

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const [progress, mediaPage, statuses] = await Promise.all([
        this.progressService.listMine(),
        this.mediaService.list(1, 100),
        this.progressService.listStatuses()
      ]);

      const mediaMap = new Map(mediaPage.items.map(m => [m.id, m]));
      
      const enriched = progress.map(p => ({
        progress: p,
        media: mediaMap.get(p.media_id)!
      })).filter(i => i.media);

      const grouped = statuses.map(s => ({
        status: s,
        items: enriched.filter(i => i.progress.status_id === s.id)
      }));

      this.columns.set(grouped);
    } catch (e) {
      console.error('Failed to load progress data', e);
    } finally {
      this.loading.set(false);
    }
  }

  viewDetails(mediaId: number) {
    this.router.navigate(['/user/media', mediaId]);
  }

  async moveStatus(progressId: number, statusId: number) {
    try {
      await this.progressService.patchStatus(progressId, statusId);
      await this.loadData(); // Reload to refresh columns
    } catch (e) {
      console.error('Failed to move status', e);
    }
  }

  async deleteProgress(progressId: number) {
    if (!confirm('Are you sure you want to remove this item from your library?')) return;
    try {
      await this.progressService.delete(progressId);
      await this.loadData();
    } catch (e) {}
  }
}
