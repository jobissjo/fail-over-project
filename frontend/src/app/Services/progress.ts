import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';

export type UserMediaProgressOut = {
  id: number;
  user_id: number;
  media_id: number;
  status_id: number;
  unit_id?: number | null;
  completed: boolean;
};

export type ProgressUpsert = {
  media_id: number;
  status_id: number;
  unit_id?: number | null;
  completed?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class Progress {
  constructor(private readonly http: HttpClient) {}

  async listMine(): Promise<UserMediaProgressOut[]> {
    return await firstValueFrom(this.http.get<UserMediaProgressOut[]>(`${environment.apiBaseUrl}/api/progress/`));
  }

  async upsert(payload: ProgressUpsert): Promise<UserMediaProgressOut> {
    return await firstValueFrom(this.http.post<UserMediaProgressOut>(`${environment.apiBaseUrl}/api/progress/`, payload));
  }

  async patchStatus(progressId: number, status_id: number): Promise<UserMediaProgressOut> {
    return await firstValueFrom(
      this.http.patch<UserMediaProgressOut>(`${environment.apiBaseUrl}/api/progress/${progressId}`, { status_id }),
    );
  }

  async delete(progressId: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${environment.apiBaseUrl}/api/progress/${progressId}`));
  }

  async listStatuses(): Promise<any[]> {
    return await firstValueFrom(this.http.get<any[]>(`${environment.apiBaseUrl}/api/status/`));
  }
}
