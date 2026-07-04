import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { DataService } from '../../core/services/data';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth'; 

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
  
  userName: string = 'Estudiante'; 
  userPhoto: string = ''; 

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private auth: Auth 
  ) {
    this.currentSelectedDate = new Date().toISOString().split('T')[0];
  }

  // [INICIALIZACIÓN SEGURA]
  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        if (user.displayName) {
          this.userName = user.displayName.split(' ')[0];
        }
        this.userPhoto = user.photoURL || ''; 

        this.tasks$ = this.dataService.getTasks();
        
        this.tasks$.subscribe(tasks => {
          this.allTasks = tasks;
          
          this.highlightedDates = tasks.map(task => ({
            date: task.dueDate,
            textColor: '#ffffff',
            backgroundColor: '#3880ff'
          }));

          this.filterTasksByDate(this.currentSelectedDate);
        });
      } else {
        this.router.navigateByUrl('/auth', { replaceUrl: true });
      }
    });
  }

  // [FILTRADO DE TAREAS]
  onDateChange(event: any) {
    this.currentSelectedDate = event.detail.value.split('T')[0];
    this.filterTasksByDate(this.currentSelectedDate);
  }

  filterTasksByDate(date: string) {
    this.selectedDateTasks = this.allTasks.filter(task => task.dueDate === date);
  }

  // [GESTIÓN DE ESTADO]
  async toggleComplete(task: any) {
    try {
      await this.dataService.updateTask(task.id, { isCompleted: !task.isCompleted });
    } catch (error) {
      console.error('Error al actualizar el estado de la tarea:', error);
    }
  }

  // [ESTILOS DINÁMICOS]
  getPriorityColor(priority: string): string {
    switch(priority) {
      case 'Crítica': return 'danger';
      case 'Alta': return 'warning';
      case 'Media': return 'primary';
      case 'Baja': return 'medium';
      default: return 'primary';
    }
  }

  // [CIERRE DE SESIÓN]
  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/auth', { replaceUrl: true });
  }
}