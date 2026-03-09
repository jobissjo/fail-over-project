import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../core/auth/token.service';
import { decodeJwt } from '../../core/auth/jwt';
import { Progress } from '../../Services/progress';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly tokenService = inject(TokenService);
  private readonly progressService = inject(Progress);

  user = signal<{username: string, role: string} | null>(null);
  stats = signal({
    completed: 0,
    active: 0,
    planned: 0,
    total: 0
  });
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    const token = this.tokenService.get();
    if (token) {
      const payload = decodeJwt(token);
      this.user.set({
        username: payload?.username || 'User',
        role: payload?.role || 'user'
      });
    }

    await this.loadStats();
  }

  async loadStats() {
    this.loading.set(true);
    try {
      const progress = await this.progressService.listMine();
      const statuses = await this.progressService.listStatuses();
      
      const finishedId = statuses.find(s => s.category === 'done')?.id;
      const activeId = statuses.find(s => s.category === 'active')?.id;
      const plannedId = statuses.find(s => s.category === 'todo')?.id;

      this.stats.set({
        completed: progress.filter(p => p.status_id === finishedId || p.completed).length,
        active: progress.filter(p => p.status_id === activeId && !p.completed).length,
        planned: progress.filter(p => p.status_id === plannedId).length,
        total: progress.length
      });
    } catch (e) {
      console.error('Failed to load profile stats', e);
    } finally {
      this.loading.set(false);
    }
  }
}
