import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Media } from '../../Services/media';

@Component({
  selector: 'app-media-types',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media-types.html',
  styleUrl: './media-types.css',
})
export class MediaTypes implements OnInit {
  private readonly mediaService = inject(Media);

  types = signal<any[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.loadTypes();
  }

  async loadTypes() {
    this.loading.set(true);
    try {
      const data = await this.mediaService.listTypes();
      this.types.set(data);
    } catch (e) {
      console.error('Failed to load types', e);
    } finally {
      this.loading.set(false);
    }
  }
}
