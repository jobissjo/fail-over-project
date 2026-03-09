import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Media } from '../../Services/media';
import { MediaRequest } from '../../Services/media-request';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly mediaService = inject(Media);
  private readonly mediaRequestService = inject(MediaRequest);

  stats = signal({
    totalMedia: 0,
    pendingRequests: 0,
    totalRequests: 0,
  });
  
  recentRequests = signal<any[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.loadStats();
  }

  async loadStats() {
    this.loading.set(true);
    try {
      const [mediaPage, requests] = await Promise.all([
        this.mediaService.list(1, 1),
        this.mediaRequestService.listAll()
      ]);

      this.stats.set({
        totalMedia: mediaPage.meta.total,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        totalRequests: requests.length
      });

      this.recentRequests.set(requests.slice(0, 5));
    } catch (e) {
      console.error('Failed to load admin stats', e);
    } finally {
      this.loading.set(false);
    }
  }
}
