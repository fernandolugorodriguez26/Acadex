import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {
  
  constructor() {
    this.initializeApp();
  }

  initializeApp() {
    const savedTheme = localStorage.getItem('acadex_theme') || 'system';
    this.applyTheme(savedTheme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('acadex_theme') === 'system') {
        if (e.matches) {
          document.documentElement.classList.add('ion-palette-dark');
        } else {
          document.documentElement.classList.remove('ion-palette-dark');
        }
      }
    });
  }

  applyTheme(theme: string) {
    if (theme === 'dark') {
      document.documentElement.classList.add('ion-palette-dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('ion-palette-dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('ion-palette-dark');
      } else {
        document.documentElement.classList.remove('ion-palette-dark');
      }
    }
  }
}