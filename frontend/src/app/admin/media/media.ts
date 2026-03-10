import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Media as MediaService, MediaOut } from '../../Services/media';
import { MediaTypeService, MediaTypeOut } from '../../Services/media-type';

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
  private readonly mediaTypeService = inject(MediaTypeService);

  mediaList = signal<MediaOut[]>([]);
  mediaTypes = signal<MediaTypeOut[]>([]);
  loading = signal(true);
  
  editingMedia = signal<MediaOut | null>(null);
  showForm = signal(false);
  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      image: [''],
      media_type_id: [null, [Validators.required]],
      total_series: [0],
    });

    this.loadInitialData();
  }

  async loadInitialData() {
    this.loading.set(true);
    try {
      const [mediaPage, types] = await Promise.all([
        this.mediaService.list(1, 100),
        this.mediaTypeService.list()
      ]);
      this.mediaList.set(mediaPage.items);
      this.mediaTypes.set(types);
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      this.loading.set(false);
    }
  }

  async loadMedia() {
    try {
      const page = await this.mediaService.list(1, 100);
      this.mediaList.set(page.items);
    } catch (e) {
      console.error('Failed to load media', e);
    }
  }

  openCreateForm() {
    this.editingMedia.set(null);
    this.form.reset({ media_type_id: this.mediaTypes()[0]?.id || null, total_series: 0 });
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

  getMediaTypeName(m: MediaOut): string {
    if (m.type_name) return m.type_name;
    return this.mediaTypes().find(t => t.id === m.media_type_id)?.name || `ID: ${m.media_type_id}`;
  }
}
