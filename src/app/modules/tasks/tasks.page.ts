import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../core/services/data';
import { ToastController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: false
})
export class TasksPage implements OnInit {
  taskForm: FormGroup;
  tasks$: Observable<any[]> | null = null;
  subjects$: Observable<any[]> | null = null; 
  
  allTasks: any[] = [];
  filteredTasks: any[] = [];
  currentFilter: string = 'all';

  selectedFile: File | null = null;
  
  // Gamificación y Racha
  totalTasks: number = 0;
  completedTasks: number = 0;
  progressPercentage: number = 0;
  studyStreak: number = 0; // NUEVO: Contador de racha

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      subjectName: ['', Validators.required],
      dueDate: ['', Validators.required],
      category: ['Tarea', Validators.required], 
      priority: ['Media', Validators.required], 
      notes: [''], // NUEVO: Campo de Notas Rápidas
      isCompleted: [false]
    });
  }

  ngOnInit() {
    this.subjects$ = this.dataService.getSubjects();
    this.tasks$ = this.dataService.getTasks();

    this.tasks$.subscribe(tasks => {
      this.allTasks = tasks;
      
      // Estadísticas básicas
      this.totalTasks = tasks.length;
      this.completedTasks = tasks.filter(t => t.isCompleted).length;
      this.progressPercentage = this.totalTasks > 0 ? (this.completedTasks / this.totalTasks) : 0;

      this.calculateStreak(tasks);
      this.applyFilter(this.currentFilter); // Reaplicar el filtro actual al recibir nuevos datos
    });
  }

  // ==========================================
  // NUEVO: SISTEMA DE FILTROS RÁPIDOS
  // ==========================================
  applyFilter(filter: string) {
    this.currentFilter = filter;
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Calculamos la fecha de dentro de 7 días
    const nextWeekDate = new Date();
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    const nextWeekStr = nextWeekDate.toISOString().split('T')[0];

    switch (filter) {
      case 'today':
        this.filteredTasks = this.allTasks.filter(t => t.dueDate === todayStr && !t.isCompleted);
        break;
      case 'week':
        this.filteredTasks = this.allTasks.filter(t => t.dueDate >= todayStr && t.dueDate <= nextWeekStr && !t.isCompleted);
        break;
      case 'pending':
        this.filteredTasks = this.allTasks.filter(t => !t.isCompleted);
        break;
      case 'completed':
        this.filteredTasks = this.allTasks.filter(t => t.isCompleted);
        break;
      default: // 'all'
        this.filteredTasks = [...this.allTasks];
        break;
    }
  }

  // ==========================================
  // NUEVO: ALGORITMO DE RACHA (STREAK)
  // ==========================================
  calculateStreak(tasks: any[]) {
    // Extraemos las fechas únicas en las que se completó alguna tarea
    const completedDates = tasks
      .filter(t => t.isCompleted && t.completedDate)
      .map(t => t.completedDate);
    
    const uniqueDates = [...new Set(completedDates)].sort((a, b) => b.localeCompare(a)); // Orden descendente

    if (uniqueDates.length === 0) {
      this.studyStreak = 0;
      return;
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);

    // Revisamos si hoy o ayer se hizo algo para mantener la racha viva
    const todayStr = today.toISOString().split('T')[0];
    
    let yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
      this.studyStreak = 0; // Se rompió la racha
      return;
    }

    // Contamos hacia atrás cuántos días consecutivos hay
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === todayStr) {
        // Si no hicimos nada hoy, pero sí ayer, la racha sigue viva (pero hoy no cuenta aún)
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break; // Se rompió la secuencia
      }
    }

    this.studyStreak = streak;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async addTask() {
    if (this.taskForm.invalid) return;

    const loading = await this.loadingCtrl.create({ message: 'Guardando asignación...' });
    await loading.present();

    try {
      let attachmentUrl = null;

      if (this.selectedFile) {
        attachmentUrl = await this.dataService.uploadTaskAttachment(this.selectedFile);
      }

      const finalTaskData = {
        ...this.taskForm.value,
        attachmentUrl: attachmentUrl,
        fileName: this.selectedFile ? this.selectedFile.name : null
      };

      await this.dataService.addTask(finalTaskData);
      
      this.taskForm.reset({ isCompleted: false, category: 'Tarea', priority: 'Media', subjectName: '', notes: '' });
      this.selectedFile = null;
      
      await loading.dismiss();
      this.showToast('Asignación creada con éxito', 'success');
    } catch (error) {
      await loading.dismiss();
      this.showToast('Error al guardar la asignación', 'danger');
    }
  }

  async toggleComplete(task: any) {
    try {
      const isNowCompleted = !task.isCompleted;
      // NUEVO: Guardamos la fecha exacta en la que se completó para calcular la racha
      const completedDate = isNowCompleted ? new Date().toISOString().split('T')[0] : null;
      
      await this.dataService.updateTask(task.id, { 
        isCompleted: isNowCompleted,
        completedDate: completedDate 
      });
    } catch (error) {
      this.showToast('Error al actualizar', 'danger');
    }
  }

  async deleteTask(taskId: string) {
    try {
      await this.dataService.deleteTask(taskId);
      this.showToast('Tarea eliminada', 'warning');
    } catch (error) {
      this.showToast('Error al eliminar', 'danger');
    }
  }

  getPriorityColor(priority: string): string {
    switch(priority) {
      case 'Crítica': return 'danger';
      case 'Alta': return 'warning';
      case 'Media': return 'primary';
      case 'Baja': return 'medium';
      default: return 'primary';
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    await toast.present();
  }
}