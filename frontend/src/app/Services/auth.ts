import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  login(username: string, password: string): Promise<string> {
    // TODO: Implement login logic
    return Promise.resolve('user');
  }
  
}
