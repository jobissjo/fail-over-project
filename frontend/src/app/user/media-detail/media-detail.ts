import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Media, MediaOut } from '../../Services/media';
import { Progress, UserMediaProgressOut } from '../../Services/progress';

@Component({
  selector: 'app-media-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media-detail.html',
  styleUrl: './media-detail.css',
})
export class MediaDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mediaService = inject(Media);
  private readonly progressService = inject(Progress);

  media = signal<MediaOut | null>(null);
  units = signal<any[]>([]);
  userProgress = signal<UserMediaProgressOut | null>(null);
  statuses = signal<any[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/user/explore']);
      return;
    }

    try {
      const [mediaData, unitsData, allProgress, allStatuses] = await Promise.all([
        this.mediaService.get(id),
        this.mediaService.listUnits(id),
        this.progressService.listMine(),
        this.progressService.listStatuses()
      ]);

      this.media.set(mediaData);
      this.units.set(unitsData);
      this.statuses.set(allStatuses);
      
      const progress = allProgress.find(p => p.media_id === id);
      this.userProgress.set(progress || null);

    } catch (e) {
      console.error('Failed to load media details', e);
    } finally {
      this.loading.set(false);
    }
  }

  async updateStatus(statusId: number) {
    if (!this.media()) return;
    
    try {
      if (this.userProgress()) {
        const updated = await this.progressService.patchStatus(this.userProgress()!.id, statusId);
        this.userProgress.set(updated);
      } else {
        const created = await this.progressService.upsert({
          media_id: this.media()!.id,
          status_id: statusId,
          completed: false
        });
        this.userProgress.set(created);
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  }

  async toggleUnitProgress(unitId: number) {
    // Current backend doesn't seem to have unit-level progress tracking (just 'unit_id' in progress)
    // We'll update the main progress to this unit
    if (!this.userProgress()) {
      // Create progress first if it doesn't exist
      await this.updateStatus(1); // Default to first status or handled by UI
    }
    
    try {
      const updated = await this.progressService.upsert({
        media_id: this.media()!.id,
        status_id: this.userProgress()!.status_id,
        unit_id: unitId,
        completed: this.userProgress()!.completed
      });
      this.userProgress.set(updated);
    } catch (e) {}
  }

  getStatusName(id: number): string {
    return this.statuses().find(s => s.id === id)?.name || 'Unknown';
  }

  get progressPercentage(): number {
    if (!this.media()?.total_series) return this.userProgress()?.completed ? 100 : 0;
    // Simple calculation based on unit_id (assuming unit_id is index-like or we find index in units)
    const currentUnitId = this.userProgress()?.unit_id;
    if (!currentUnitId) return 0;
    const index = this.units().findIndex(u => u.id === currentUnitId);
    return Math.round(((index + 1) / this.media()!.total_series) * 100);
  }
}
