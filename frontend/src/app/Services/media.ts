import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';

export type MediaOut = {
  id: number;
  title: string;
  image?: string | null;
  media_type_id: number;
  type_name?: string | null;
  type_structure?: string | null;
  total_series: number;
  description?: string | null;
  media_type?: string | null;
};

export type PageMeta = {
  page: number;
  size: number;
  total: number;
};

export type Page<T> = {
  items: T[];
  meta: PageMeta;
};

@Injectable({
  providedIn: 'root',
})
export class Media {
  constructor(private readonly http: HttpClient) {}

  async list(page = 1, size = 20): Promise<Page<MediaOut>> {
    return await firstValueFrom(
      this.http.get<Page<MediaOut>>(`${environment.apiBaseUrl}/api/media/`, {
        params: {
          page,
          size,
        },
      }),
    );
  }

  async get(id: number): Promise<MediaOut> {
    return await firstValueFrom(this.http.get<MediaOut>(`${environment.apiBaseUrl}/api/media/${id}`));
  }

  async create(payload: any): Promise<MediaOut> {
    return await firstValueFrom(this.http.post<MediaOut>(`${environment.apiBaseUrl}/api/media/`, payload));
  }

  async update(id: number, payload: any): Promise<MediaOut> {
    return await firstValueFrom(this.http.put<MediaOut>(`${environment.apiBaseUrl}/api/media/${id}`, payload));
  }

  async delete(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${environment.apiBaseUrl}/api/media/${id}`));
  }

  async listUnits(mediaId: number): Promise<any[]> {
    return await firstValueFrom(
      this.http.get<any[]>(`${environment.apiBaseUrl}/api/media-units/`, {
        params: { media_id: mediaId },
      }),
    );
  }

  async listTypes(): Promise<any[]> {
    return await firstValueFrom(this.http.get<any[]>(`${environment.apiBaseUrl}/api/media-types/`));
  }
}
