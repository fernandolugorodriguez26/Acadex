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
  studyStreak: number = 0;

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
      notes: [''], 
      isCompleted: [false]
    });
  }

  ngOnInit() {
    this.subjects$ = this.dataService.getSubjects();
    this.tasks$ = this.dataService.getTasks();

    this.tasks$.subscribe(tasks => {
      this.allTasks = tasks;
      
      this.totalTasks = tasks.length;
      this.completedTasks = tasks.filter(t => t.isCompleted).length;
      this.progressPercentage = this.totalTasks > 0 ? (this.completedTasks / this.totalTasks) : 0;

      this.calculateStreak(tasks);
      this.applyFilter(this.currentFilter); 
    });
  }

  applyFilter(filter: string) {
    this.currentFilter = filter;
    const todayStr = new Date().toISOString().split('T')[0];
    
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
      default:
        this.filteredTasks = [...this.allTasks];
        break;
    }
  }

  calculateStreak(tasks: any[]) {
    const completedDates = tasks
      .filter(t => t.isCompleted && t.completedDate)
      .map(t => t.completedDate);
    
    const uniqueDates = [...new Set(completedDates)].sort((a, b) => b.localeCompare(a));

    if (uniqueDates.length === 0) {
      this.studyStreak = 0;
      return;
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);

    const todayStr = today.toISOString().split('T')[0];
    
    let yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
      this.studyStreak = 0;
      return;
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === todayStr) {
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
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

  // ==========================================
  // NUEVO: IMPORTADOR DE MOODLE (.ics)
  // ==========================================
  
  triggerIcsUpload() {
    document.getElementById('ics-upload')?.click();
  }

  async onIcsSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const loading = await this.loadingCtrl.create({ message: 'Procesando calendario de UAPA...' });
    await loading.present();

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = (e.target as FileReader).result as string;
      const tasksToImport = this.parseIcsData(text);

      if (tasksToImport.length === 0) {
        await loading.dismiss();
        this.showToast('No se encontraron tareas legibles en el archivo.', 'warning');
        return;
      }

      try {
        for (const task of tasksToImport) {
          await this.dataService.addTask(task);
        }
        await loading.dismiss();
        this.showToast(`¡Éxito! ${tasksToImport.length} tareas sincronizadas`, 'success');
      } catch (error) {
        await loading.dismiss();
        this.showToast('Error al guardar las tareas importadas', 'danger');
      }
    };
    reader.readAsText(file);
    
    event.target.value = null;
  }
  
  parseIcsData(icsData: string): any[] {
    const events: any[] = [];
    const vevents = icsData.split('BEGIN:VEVENT');
    
    for (let i = 1; i < vevents.length; i++) {
      const ev = vevents[i];
      
      const summaryMatch = ev.match(/SUMMARY:(.*)/);
      let title = summaryMatch ? summaryMatch[1].trim() : 'Asignación Importada';
      
      // Limpiamos los textos genéricos de Moodle
      title = title.replace('Vencimiento de ', '').replace('Espacio para colgar el ', '').trim();

      // ==================================================
      // CLASIFICACIÓN INTELIGENTE DE TAREAS
      // ==================================================
      let assignedPriority = 'Media'; // Valor por defecto
      let assignedCategory = 'Tarea'; // Valor por defecto
      const titleLower = title.toLowerCase();

      // 1. Crítica: Proyectos y Trabajos Finales (Añadimos "proeycto" e "investigación final" para cubrir el error ortográfico de UAPA)
      if (titleLower.includes('proyecto') || titleLower.includes('proeycto') || titleLower.includes('trabajo final') || titleLower.includes('investigación final')) {
        assignedPriority = 'Crítica';
        assignedCategory = 'Proyecto';
      } 
      // 2. Alta: Exámenes, Cuestionarios y Evaluaciones
      else if (titleLower.includes('examen') || titleLower.includes('cuestionario') || titleLower.includes('prueba') || titleLower.includes('evaluación') || titleLower.includes('evaluacion')) {
        assignedPriority = 'Alta';
        assignedCategory = 'Examen';
      }
      // 3. Media: Foros, Debates y Tareas regulares (como "Tarea Completaria")
      else if (titleLower.includes('foro') || titleLower.includes('debate') || titleLower.includes('tarea')) {
        assignedPriority = 'Media';
        assignedCategory = 'Tarea';
      }
      // 4. Baja: Lecturas y Material de apoyo
      else if (titleLower.includes('lectura') || titleLower.includes('material') || titleLower.includes('recurso')) {
        assignedPriority = 'Baja';
        assignedCategory = 'Lectura';
      }

      // Procesamiento de la fecha
      const dtstartMatch = ev.match(/DTSTART:(.*)/);
      let dueDate = '';
      if (dtstartMatch) {
        const rawDate = dtstartMatch[1].trim();
        if (rawDate.length >= 8) {
          dueDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;
        }
      }

      if (dueDate) {
        events.push({
          title: title,
          dueDate: dueDate,
          subjectName: 'Importado de Moodle',
          category: assignedCategory,
          priority: assignedPriority,
          notes: '📌 Sincronizado automáticamente desde el calendario universitario.',
          isCompleted: false
        });
      }
    }
    return events;
  }
}