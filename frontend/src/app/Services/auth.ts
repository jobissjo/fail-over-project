import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { decodeJwt } from '../core/auth/jwt';
import { TokenService } from '../core/auth/token.service';

type TokenOut = {
  access_token: string;
  token_type: string;
};

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService,
  ) {}

  async login(username: string, password: string): Promise<'admin' | 'user'> {
    const res = await firstValueFrom(
      this.http.post<TokenOut>(`${environment.apiBaseUrl}/api/auth/login`, {
        username,
        password,
      }),
    );

    this.tokenService.set(res.access_token);
    const payload = decodeJwt(res.access_token);
    return payload?.role === 'admin' ? 'admin' : 'user';
  }

  async register(payload: any): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiBaseUrl}/api/auth/register`, payload)
    );
  }

  logout(): void {
    this.tokenService.clear();
  }
}
