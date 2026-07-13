import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private firestore: Firestore, private auth: Auth) { }

  private get userId() {
    return this.auth.currentUser?.uid;
  }

  // ==========================================
  // NOTIFICACIONES PARA TAREAS
  // ==========================================
  async scheduleTaskNotification(task: any) {
    if (!this.userId || !task.dueDate) return;

    try {
      const userDocRef = doc(this.firestore, `users/${this.userId}`);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) return;
      const userData = userDocSnap.data();

      const enabled = userData['notificationsEnabled'] !== undefined ? userData['notificationsEnabled'] : true;
      if (!enabled) return;

      const daysBefore = userData['notificationDays'] || 2;
      const timeString = userData['notificationTime'] || '10:00'; 

      const targetDate = new Date(task.dueDate + 'T00:00:00');
      targetDate.setDate(targetDate.getDate() - daysBefore);

      const [hours, minutes] = timeString.split(':');
      targetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      if (targetDate.getTime() <= Date.now()) return;

      const notificationId = this.stringToHash(task.id || task.title);
      await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });

      if (task.isCompleted) return;

      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: `🔔 Entrega Próxima: ${task.title}`,
            body: `Tu asignación de la materia ${task.subjectName || 'Acadex'} vence en ${daysBefore} días. ¡Que no se te pase!`,
            schedule: { at: targetDate },
            sound: 'default',
            actionTypeId: '',
            extra: { taskId: task.id }
          }
        ]
      });
    } catch (error) {
      console.error('Error al programar la notificación de tarea:', error);
    }
  }

  async cancelTaskNotification(task: any) {
    const notificationId = this.stringToHash(task.id || task.title);
    await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
  }

  // ==========================================
  // NOTIFICACIONES PARA CLASES (Recurrentes Semanales)
  // ==========================================
  async scheduleClassNotification(subject: any) {
    // Verificamos que la materia tenga configurado un día y una hora de inicio
    if (!this.userId || !subject.dayOfWeek || !subject.startTime) return;

    try {
      const userDocRef = doc(this.firestore, `users/${this.userId}`);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const enabled = userDocSnap.data()['notificationsEnabled'] !== undefined ? userDocSnap.data()['notificationsEnabled'] : true;
        if (!enabled) return;
      }

      // Convertimos la hora de inicio de la clase (ej. "14:00") a números
      const [classHours, classMinutes] = subject.startTime.split(':').map(Number);
      
      // Creamos un objeto Date temporal para restar la hora y media (90 minutos)
      let alarmTime = new Date();
      alarmTime.setHours(classHours, classMinutes, 0, 0);
      alarmTime.setMinutes(alarmTime.getMinutes() - 90);

      const alarmHour = alarmTime.getHours();
      const alarmMinute = alarmTime.getMinutes();

      // Generamos un ID único para la clase (distinto al de las tareas)
      const notificationId = this.stringToHash((subject.id || subject.code) + '_class');
      await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });

      // Programamos la alarma recurrente
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: `🏫 Clase próxima: ${subject.name}`,
            body: `Tu clase comienza en 1 hora y 30 minutos. ¡Prepárate!`,
            // Capacitor usa números para los días: 1=Domingo, 2=Lunes, 3=Martes... 7=Sábado
            schedule: { 
              on: { 
                weekday: subject.dayOfWeek, 
                hour: alarmHour, 
                minute: alarmMinute 
              },
              allowWhileIdle: true
            },
            sound: 'default'
          }
        ]
      });

      console.log(`Alarma de clase programada para el día ${subject.dayOfWeek} a las ${alarmHour}:${alarmMinute}`);

    } catch (error) {
      console.error('Error al programar la notificación de la clase:', error);
    }
  }

  async cancelClassNotification(subject: any) {
    const notificationId = this.stringToHash((subject.id || subject.code) + '_class');
    await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
  }

  // ==========================================
  // UTILIDADES
  // ==========================================
  private stringToHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }
}