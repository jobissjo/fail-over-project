import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MediaRequest, MediaRequestOut } from '../../Services/media-request';

@Component({
  selector: 'app-user-media-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-media-request.html',
  styleUrl: './user-media-request.css',
})
export class UserMediaRequest implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly mediaRequestService = inject(MediaRequest);

  requests = signal<MediaRequestOut[]>([]);
  loading = signal(true);
  submitting = signal(false);
  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      media_title: ['', [Validators.required]],
      request_type: ['ADD', [Validators.required]],
      description: ['', [Validators.required]],
    });

    this.loadRequests();
  }

  async loadRequests() {
    this.loading.set(true);
    try {
      const data = await this.mediaRequestService.listMine();
      this.requests.set(data.sort((a, b) => b.id - a.id));
    } catch (e) {
      console.error('Failed to load requests', e);
    } finally {
      this.loading.set(false);
    }
  }

  async submitRequest() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    try {
      await this.mediaRequestService.create(this.form.getRawValue());
      this.form.reset({ request_type: 'ADD' });
      await this.loadRequests();
    } catch (e) {
      console.error('Failed to submit request', e);
    } finally {
      this.submitting.set(false);
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
