import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { DataService } from '../../core/services/data';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  tasks$: Observable<any[]> | null = null;
  allTasks: any[] = [];
  selectedDateTasks: any[] = [];
  highlightedDates: any[] = [];
  currentSelectedDate: string = '';

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router
  ) {
    // Al arrancar, guardamos por defecto la fecha de hoy en formato YYYY-MM-DD
    this.currentSelectedDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    this.tasks$ = this.dataService.getTasks();
    
    // Escucha activa en tiempo real desde Cloud Firestore
    this.tasks$.subscribe(tasks => {
      this.allTasks = tasks;
      
      // Mapeo dinámico para colorear los días que tienen asignaciones
      this.highlightedDates = tasks.map(task => ({
        date: task.dueDate,
        textColor: '#ffffff',
        backgroundColor: '#3880ff'
      }));

      // Mantiene el filtrado sobre la fecha actual que el usuario está visualizando
      this.filterTasksByDate(this.currentSelectedDate);
    });
  }

  onDateChange(event: any) {
    this.currentSelectedDate = event.detail.value.split('T')[0];
    this.filterTasksByDate(this.currentSelectedDate);
  }

  filterTasksByDate(date: string) {
    this.selectedDateTasks = this.allTasks.filter(task => task.dueDate === date);
  }

  // HU-04: Operación de actualización directa de estado extremo a extremo
  async toggleComplete(task: any) {
    try {
      await this.dataService.updateTask(task.id, { isCompleted: !task.isCompleted });
    } catch (error) {
      console.error('Error al actualizar el estado de la tarea:', error);
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/auth', { replaceUrl: true });
  }
}