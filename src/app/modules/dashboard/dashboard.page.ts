import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { DataService } from '../../core/services/data';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth'; // <-- 1. Importación correcta de AngularFire

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
  
  // <-- 2. Variable para guardar el nombre del usuario
  userName: string = 'Estudiante'; 

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private auth: Auth // <-- 3. Inyectamos la conexión segura
  ) {
    this.currentSelectedDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    // <-- 4. Leemos el perfil registrado de forma silenciosa y sin errores
    const user = this.auth.currentUser;
    if (user && user.displayName) {
      // Usamos el split para tomar solo el primer nombre (ej. "Fernando Lugo" -> "Fernando")
      this.userName = user.displayName.split(' ')[0]; 
    }

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
  }

  onDateChange(event: any) {
    this.currentSelectedDate = event.detail.value.split('T')[0];
    this.filterTasksByDate(this.currentSelectedDate);
  }

  filterTasksByDate(date: string) {
    this.selectedDateTasks = this.allTasks.filter(task => task.dueDate === date);
  }

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