import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../Services/auth';
import { TokenService } from '../../core/auth/token.service';
import { decodeJwt } from '../../core/auth/jwt';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
})
export class AdminShell {
  private readonly auth = inject(Auth);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  get username(): string {
    const token = this.tokenService.get();
    if (!token) return 'Admin';
    const payload = decodeJwt(token);
    return payload?.username || 'Admin';
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
