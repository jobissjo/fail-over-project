import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../Services/auth';
import { TokenService } from '../../core/auth/token.service';
import { decodeJwt } from '../../core/auth/jwt';

@Component({
  selector: 'app-user-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './user-shell.html',
  styleUrl: './user-shell.css',
})
export class UserShell implements OnInit {
  private readonly auth = inject(Auth);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  isLightMode = signal(false);

  ngOnInit() {
    this.initTheme();
  }

  get isAdmin(): boolean {
    const token = this.tokenService.get();
    if (!token) return false;
    const payload = decodeJwt(token);
    return payload?.role === 'admin';
  }

  get username(): string {
    const token = this.tokenService.get();
    if (!token) return 'Guest';
    const payload = decodeJwt(token);
    return payload?.username || 'User';
  }

  toggleTheme() {
    this.isLightMode.update(val => !val);
    const theme = this.isLightMode() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  private initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    this.isLightMode.set(savedTheme === 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
