import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Auth } from '../../Services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  form!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: Auth,
    private readonly router: Router,
  ) {}

  // form = this.fb.nonNullable.group({
  //   username: ['', [Validators.required]],
  //   password: ['', [Validators.required]],
  // });

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);
    try {
      const { username, password } = this.form.getRawValue();
      const role = await this.auth.login(username, password);

      if (role === 'admin') {
        await this.router.navigateByUrl('/admin/dashboard');
      } else {
        await this.router.navigateByUrl('/user/dashboard');
      }
    } catch (e: any) {
      this.error.set(e?.message ?? 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }
}
