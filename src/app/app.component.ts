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
  // CONFIGURACIÓN DE NOTIFICACIONES SEGURA
  // ==========================================
  async setupNotifications() {
    try {
      // 1. --- NOTIFICACIONES LOCALES (Alarmas de Tareas y Materias) ---
      // Esto funciona de manera nativa y NO requiere configuraciones externas en Firebase
      const localPermStatus = await LocalNotifications.requestPermissions();
      
      if (localPermStatus.display === 'granted') {
        console.log('Permisos de notificaciones locales concedidos.');

        LocalNotifications.addListener('localNotificationReceived', (notification) => {
          console.log('Alarma de tarea recibida en primer plano: ', notification);
        });

        LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
          console.log('El usuario interactuó con la alarma: ', action);
        });
      }

    } catch (error) {
      console.error('Error controlado en el setup de notificaciones:', error);
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