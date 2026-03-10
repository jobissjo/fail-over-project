import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MediaTypeService, MediaTypeOut } from '../../Services/media-type';

@Component({
  selector: 'app-media-types',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './media-types.html',
  styleUrl: './media-types.css',
})
export class MediaTypes implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly mediaTypeService = inject(MediaTypeService);

  types = signal<MediaTypeOut[]>([]);
  loading = signal(true);
  
  editingType = signal<MediaTypeOut | null>(null);
  showForm = signal(false);
  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      structure: ['series', [Validators.required]],
    });
    this.loadTypes();
  }

  async loadTypes() {
    this.loading.set(true);
    try {
      const data = await this.mediaTypeService.list();
      this.types.set(data);
    } catch (e) {
      console.error('Failed to load types', e);
    } finally {
      this.loading.set(false);
    }
  }

  openCreateForm() {
    this.editingType.set(null);
    this.form.reset();
    this.showForm.set(true);
  }

  editType(type: MediaTypeOut) {
    this.editingType.set(type);
    this.form.patchValue(type);
    this.showForm.set(true);
  }

  async submitForm() {
    if (this.form.invalid) return;

    try {
      const payload = this.form.getRawValue();
      if (this.editingType()) {
        await this.mediaTypeService.update(this.editingType()!.id, payload);
      } else {
        await this.mediaTypeService.create(payload);
      }
      this.showForm.set(false);
      await this.loadTypes();
    } catch (e) {
      console.error('Failed to save media type', e);
    }
  }

  async deleteType(id: number) {
    if (!confirm('Are you sure? This might affect media assigned to this type.')) return;
    try {
      await this.mediaTypeService.delete(id);
      await this.loadTypes();
    } catch (e) {
      console.error('Failed to delete media type', e);
    }
  }
}
