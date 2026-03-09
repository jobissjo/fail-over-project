import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-media-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media-card.html',
  styleUrl: './media-card.css',
})
export class MediaCard {
  @Input() media: any;
  @Input() progress: any;
  @Input() compact = false;
  @Output() viewDetails = new EventEmitter<number>();
  @Output() updateProgress = new EventEmitter<any>();

  get progressPercentage(): number {
    if (!this.media || !this.media.total_series) return 0;
    // Assuming progress has 'unit_id' (current episode) or something similar
    // This is a simplified calculation for now
    return this.progress ? (this.progress.completed ? 100 : 50) : 0;
  }

  get statusLabel(): string {
    if (!this.progress) return 'Todo';
    // Mapping status_id to label would ideally come from a shared service/enum
    return this.progress.completed ? 'Done' : 'Active';
  }

  get statusClass(): string {
    if (!this.progress) return 'bg-gray-500/20 text-gray-400';
    return this.progress.completed ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400';
  }

  onCardClick() {
    this.viewDetails.emit(this.media.id);
  }
}
