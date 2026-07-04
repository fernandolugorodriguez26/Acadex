import { Component } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {
  
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    // 1. Inicialización del Tema Oscuro/Automático
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

    // 2. Inicialización de Push Notifications (Solo si es un dispositivo móvil real)
    this.platform.ready().then(() => {
      if (this.platform.is('capacitor')) {
        this.setupPushNotifications();
      }
    });
  }

  setupPushNotifications() {
    // Solicitamos permiso al usuario (agregamos : any para cumplir con TypeScript estricto)
    PushNotifications.requestPermissions().then((result: any) => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });

    // Escuchamos cuando la notificación llega
    PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
      console.log('Notificación recibida: ', notification);
    });

    // Escuchamos si el usuario toca la notificación
    PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
      console.log('El usuario tocó la notificación: ', action);
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