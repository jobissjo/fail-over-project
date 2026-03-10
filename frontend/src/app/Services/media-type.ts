import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export type MediaTypeOut = {
  id: number;
  name: string;
  structure: 'single' | 'series';
};

export type MediaTypeCreate = {
  name: string;
  structure: 'single' | 'series';
};

export type MediaTypeUpdate = {
  name: string | null;
  structure: 'single' | 'series' | null;
};

@Injectable({
  providedIn: 'root',
})
export class MediaTypeService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/media-types/`;

  constructor(private readonly http: HttpClient) {}

  async list(): Promise<MediaTypeOut[]> {
    return await firstValueFrom(this.http.get<MediaTypeOut[]>(this.apiUrl));
  }

  async create(payload: MediaTypeCreate): Promise<MediaTypeOut> {
    return await firstValueFrom(this.http.post<MediaTypeOut>(this.apiUrl, payload));
  }

  async update(id: number, payload: MediaTypeUpdate): Promise<MediaTypeOut> {
    return await firstValueFrom(this.http.put<MediaTypeOut>(`${this.apiUrl}${id}`, payload));
  }

  async delete(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
  }
}
