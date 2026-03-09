import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Media as MediaService, MediaOut } from '../../Services/media';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './media.html',
  styleUrl: './media.css',
})
export class Media implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly mediaService = inject(MediaService);

  mediaList = signal<MediaOut[]>([]);
  loading = signal(true);
  
  editingMedia = signal<MediaOut | null>(null);
  showForm = signal(false);
  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      image: [''],
      media_type_id: [1, [Validators.required]],
      total_series: [0],
    });

    this.loadMedia();
  }

  async loadMedia() {
    this.loading.set(true);
    try {
      const page = await this.mediaService.list(1, 100);
      this.mediaList.set(page.items);
    } catch (e) {
      console.error('Failed to load media', e);
    } finally {
      this.loading.set(false);
    }
  }

  openCreateForm() {
    this.editingMedia.set(null);
    this.form.reset({ media_type_id: 1, total_series: 0 });
    this.showForm.set(true);
  }

  editMedia(media: MediaOut) {
    this.editingMedia.set(media);
    this.form.patchValue(media);
    this.showForm.set(true);
  }

  async submitForm() {
    if (this.form.invalid) return;

    try {
      const payload = this.form.getRawValue();
      if (this.editingMedia()) {
        await this.mediaService.update(this.editingMedia()!.id, payload);
      } else {
        await this.mediaService.create(payload);
      }
      this.showForm.set(false);
      await this.loadMedia();
    } catch (e) {
      console.error('Failed to save media', e);
    }
  }

  async deleteMedia(id: number) {
    if (!confirm('Are you sure you want to delete this media? This will delete all associated progress.')) return;
    try {
      await this.mediaService.delete(id);
      await this.loadMedia();
    } catch (e) {
      console.error('Failed to delete media', e);
    }
  }
}
