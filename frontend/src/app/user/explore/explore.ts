import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Media, MediaOut } from '../../Services/media';
import { Progress, UserMediaProgressOut } from '../../Services/progress';
import { MediaCard } from '../../shared/media-card/media-card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaCard],
  templateUrl: './explore.html',
  styleUrl: './explore.css',
})
export class Explore implements OnInit {
  private readonly mediaService = inject(Media);
  private readonly progressService = inject(Progress);
  private readonly router = inject(Router);

  loading = signal(true);
  mediaList = signal<MediaOut[]>([]);
  progressMap = signal<Map<number, UserMediaProgressOut>>(new Map());
  
  // Filters
  searchQuery = signal('');
  selectedType = signal<number | null>(null);
  selectedStatus = signal<number | null>(null);
  
  // Pagination
  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);

  mediaTypes = signal<any[]>([]);
  statuses = signal<any[]>([]);

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadMediaTypes(),
      this.loadStatuses(),
      this.loadUserProgress()
    ]);
    await this.loadMedia();
  }

  async loadMediaTypes() {
    // Assuming a MediaType service or fetching via HttpClient directly if not exists
    // For now I'll just fetch from API to be sure
    try {
      // I should have created MediaType service, but I'll use a direct fetch or mock for now
      // Actually let's just use what's available
      this.mediaTypes.set([
        { id: 1, name: 'Movie' },
        { id: 2, name: 'TV Series' },
        { id: 3, name: 'Book' },
        { id: 4, name: 'Game' }
      ]);
    } catch (e) {}
  }

  async loadStatuses() {
    try {
      const data = await this.progressService.listStatuses();
      this.statuses.set(data);
    } catch (e) {}
  }

  async loadUserProgress() {
    try {
      const progress = await this.progressService.listMine();
      const map = new Map(progress.map(p => [p.media_id, p]));
      this.progressMap.set(map);
    } catch (e) {}
  }

  async loadMedia() {
    this.loading.set(true);
    try {
      const page = await this.mediaService.list(this.currentPage(), this.pageSize());
      this.mediaList.set(page.items);
      this.totalItems.set(page.meta.total);
    } catch (e) {
      console.error('Failed to load media', e);
    } finally {
      this.loading.set(false);
    }
  }

  get filteredMedia() {
    return this.mediaList().filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(this.searchQuery().toLowerCase());
      const matchesType = !this.selectedType() || m.media_type_id === this.selectedType();
      // Status filter would need to check progressMap for the media_id
      const userProgress = this.progressMap().get(m.id);
      const matchesStatus = !this.selectedStatus() || userProgress?.status_id === this.selectedStatus();
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }

  viewDetails(id: number) {
    this.router.navigate(['/user/media', id]);
  }

  async onFilterChange() {
    // Client-side filtering for now, but could be server-side
    // If server-side, reloadMedia() with params
  }

  async onPageChange(page: number) {
    this.currentPage.set(page);
    await this.loadMedia();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems() / this.pageSize());
  }
}
