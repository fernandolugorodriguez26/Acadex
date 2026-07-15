// ==========================================
// COMPONENTE PRINCIPAL (APP ROOT)
// ==========================================

import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications'; 

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
    const savedTheme = localStorage.getItem('acadex_theme') || 'system';
    this.applyTheme(savedTheme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('acadex_theme') === 'system') {
        if (e.matches) {
          document.body.classList.add('dark', 'ion-palette-dark');
        } else {
          document.body.classList.remove('dark', 'ion-palette-dark');
        }
      }
    });

    // 2. Inicialización de la Plataforma Móvil
    this.platform.ready().then(() => {
      if (this.platform.is('capacitor')) {
        this.setupNotifications();
      }
    });
  }

  // ==========================================
  // CONFIGURACIÓN DE NOTIFICACIONES (LOCALES Y PUSH)
  // ==========================================
  async setupNotifications() {
    try {
      const localPermStatus = await LocalNotifications.requestPermissions();
      
      if (localPermStatus.display === 'granted') {
        LocalNotifications.addListener('localNotificationReceived', (notification) => {
          console.log('Alarma de tarea recibida: ', notification);
        });

        LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
          console.log('El usuario tocó la alarma de la tarea: ', action);
        });
      }

      const pushPermStatus = await PushNotifications.requestPermissions();
      if (pushPermStatus.receive === 'granted') {
        PushNotifications.register();
      }

      PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        console.log('Notificación Push recibida: ', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
        console.log('El usuario tocó la notificación Push: ', action);
      });

    } catch (error) {
      console.error('Error al configurar los permisos de notificaciones:', error);
    }
  }

  // ==========================================
  // LÓGICA DE APLICACIÓN DE TEMA
  // ==========================================
  applyTheme(theme: string) {
    if (theme === 'dark') {
      document.body.classList.add('dark', 'ion-palette-dark');
    } else if (theme === 'light') {
      document.body.classList.remove('dark', 'ion-palette-dark');
    } else {
      // Modo Sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.body.classList.add('dark', 'ion-palette-dark');
      } else {
        document.body.classList.remove('dark', 'ion-palette-dark');
      }
    }
  }
}