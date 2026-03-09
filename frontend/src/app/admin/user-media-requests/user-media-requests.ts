import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediaRequest, MediaRequestOut } from '../../Services/media-request';

@Component({
  selector: 'app-user-media-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-media-requests.html',
  styleUrl: './user-media-requests.css',
})
export class UserMediaRequests implements OnInit {
  private readonly mediaRequestService = inject(MediaRequest);

  requests = signal<MediaRequestOut[]>([]);
  loading = signal(true);
  
  editingRequest = signal<number | null>(null);
  adminNote = signal('');

  async ngOnInit(): Promise<void> {
    await this.loadRequests();
  }

  async loadRequests() {
    this.loading.set(true);
    try {
      const data = await this.mediaRequestService.listAll();
      this.requests.set(data.sort((a, b) => b.id - a.id));
    } catch (e) {
      console.error('Failed to load requests', e);
    } finally {
      this.loading.set(false);
    }
  }

  startEdit(req: MediaRequestOut) {
    this.editingRequest.set(req.id);
    this.adminNote.set(req.admin_note || '');
  }

  async updateStatus(requestId: number, status: MediaRequestOut['status']) {
    try {
      await this.mediaRequestService.adminPatch(requestId, {
        status,
        admin_note: this.adminNote()
      });
      this.editingRequest.set(null);
      await this.loadRequests();
    } catch (e) {
      console.error('Failed to update request', e);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/20 text-amber-400';
      case 'ACCEPTED': return 'bg-blue-500/20 text-blue-400';
      case 'RESOLVED': return 'bg-green-500/20 text-green-400';
      case 'REJECTED': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }
}
