import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './user-shell.html',
  styleUrl: './user-shell.css',
})
export class UserShell {}
