import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';

export type MediaRequestOut = {
  id: number;
  user_id: number;
  request_type: 'add' | 'update';
  media_id?: number | null;
  title: string;
  description?: string | null;
  media_type_id?: number | null;
  status: 'pending' | 'accepted' | 'resolving' | 'resolved' | 'rejected';
  admin_note?: string | null;
};

export type MediaRequestCreate = {
  request_type: 'add' | 'update';
  media_id?: number | null;
  title: string;
  description?: string | null;
  media_type_id?: number | null;
};

@Injectable({
  providedIn: 'root',
})
export class MediaRequest {
  constructor(private readonly http: HttpClient) {}

  async create(payload: MediaRequestCreate): Promise<MediaRequestOut> {
    return await firstValueFrom(
      this.http.post<MediaRequestOut>(`${environment.apiBaseUrl}/api/media-requests/`, payload),
    );
  }

  async listMine(): Promise<MediaRequestOut[]> {
    return await firstValueFrom(this.http.get<MediaRequestOut[]>(`${environment.apiBaseUrl}/api/media-requests/me`));
  }

  async listAll(): Promise<MediaRequestOut[]> {
    return await firstValueFrom(this.http.get<MediaRequestOut[]>(`${environment.apiBaseUrl}/api/media-requests/`));
  }

  async adminPatch(requestId: number, payload: { status: MediaRequestOut['status']; admin_note?: string | null }): Promise<MediaRequestOut> {
    return await firstValueFrom(
      this.http.patch<MediaRequestOut>(`${environment.apiBaseUrl}/api/media-requests/${requestId}`, payload),
    );
  }
}
