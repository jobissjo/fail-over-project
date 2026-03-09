import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../Services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, );
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);
    try {
      const { username, email, password } = this.form.getRawValue();
      await this.auth.register({ username, email, password });
      
      // Auto login after registration
      await this.auth.login(username, password);
      await this.router.navigateByUrl('/user/dashboard');
    } catch (e: any) {
      this.error.set(e?.error?.detail || e?.message || 'Registration failed');
    } finally {
      this.loading.set(false);
    }
  }
}
