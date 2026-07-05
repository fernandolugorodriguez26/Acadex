import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../core/services/data';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: false
})
export class TasksPage implements OnInit {
  taskForm: FormGroup;      // Formulario para Nueva Tarea
  editTaskForm: FormGroup;  // Formulario exclusivo para el Modal de Edición
  
  tasks$: Observable<any[]> | null = null;
  subjects$: Observable<any[]> | null = null; 
  
  allTasks: any[] = [];
  filteredTasks: any[] = [];
  currentFilter: string = 'all';

  selectedFile: File | null = null;
  selectedEditFile: File | null = null; // Archivo adjunto para la edición
  
  // Variables del Modal
  selectedTask: any = null;
  isModalOpen: boolean = false;
  isEditingMode: boolean = false; // Controla si el modal muestra detalles o el formulario
  
  // Gamificación y Racha
  totalTasks: number = 0;
  completedTasks: number = 0;
  progressPercentage: number = 0;
  studyStreak: number = 0;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    // Formulario de creación
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      subjectName: ['', Validators.required],
      dueDate: ['', Validators.required],
      category: ['Tarea', Validators.required], 
      priority: ['Media', Validators.required], 
      notes: [''], 
      isCompleted: [false]
    });

    // Formulario de edición
    this.editTaskForm = this.fb.group({
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

  // ==========================================
  // LÓGICA DEL MODAL: VER Y EDITAR
  // ==========================================
  openTaskDetails(task: any) {
    this.selectedTask = task;
    this.isEditingMode = false; // Siempre abre en modo "Ver detalles"
    this.selectedEditFile = null;
    this.isModalOpen = true;
  }

  closeTaskDetails() {
    this.isModalOpen = false;
    setTimeout(() => { 
      this.selectedTask = null; 
      this.isEditingMode = false;
    }, 300);
  }

  enableEditMode() {
    this.isEditingMode = true;
    this.editTaskForm.patchValue({
      title: this.selectedTask.title,
      subjectName: this.selectedTask.subjectName,
      dueDate: this.selectedTask.dueDate,
      category: this.selectedTask.category || 'Tarea',
      priority: this.selectedTask.priority || 'Media',
      notes: this.selectedTask.notes || '',
      isCompleted: this.selectedTask.isCompleted
    });
  }

  cancelEditMode() {
    this.isEditingMode = false;
    this.selectedEditFile = null;
  }

  async saveEditedTask() {
    if (this.editTaskForm.invalid) return;

    const loading = await this.loadingCtrl.create({ message: 'Actualizando asignación...' });
    await loading.present();

    try {
      // EL FIX ESTÁ AQUÍ: Agregamos "|| null" para evitar el "undefined" que bloquea Firebase
      let attachmentUrl = this.selectedTask.attachmentUrl || null;
      let fileName = this.selectedTask.fileName || null;

      // Si subió un archivo nuevo en la edición, lo subimos y reemplazamos
      if (this.selectedEditFile) {
        attachmentUrl = await this.dataService.uploadTaskAttachment(this.selectedEditFile);
        fileName = this.selectedEditFile.name;
      }

      const finalTaskData = { 
        ...this.editTaskForm.value,
        attachmentUrl: attachmentUrl,
        fileName: fileName
      };
      
      await this.dataService.updateTask(this.selectedTask.id, finalTaskData);
      
      this.showToast('Asignación actualizada con éxito', 'success');
      this.closeTaskDetails(); // Cerramos el modal
      await loading.dismiss();
    } catch (error) {
      console.error('Error detallado de Firebase:', error); // Por si acaso hay otro fallo, lo veremos en consola
      await loading.dismiss();
      this.showToast('Error al actualizar', 'danger');
    }
  }

  deleteTaskFromModal() {
    this.deleteTask(this.selectedTask.id);
    this.closeTaskDetails();
  }

  // ==========================================
  // CREACIÓN RÁPIDA DE MATERIAS
  // ==========================================
  // Ahora recibe 'formType' para saber a cuál formulario inyectar la materia
  async onSubjectChange(event: any, formType: 'new' | 'edit') {
    if (event.detail.value === 'NEW_SUBJECT') {
      const alert = await this.alertCtrl.create({
        header: 'Nueva Materia Rápida',
        inputs: [
          { name: 'code', type: 'text', placeholder: 'Código (Ej. ISW411)' },
          { name: 'name', type: 'text', placeholder: 'Nombre de la materia' },
          { name: 'professor', type: 'text', placeholder: 'Profesor (Opcional)' }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              const form = formType === 'new' ? this.taskForm : this.editTaskForm;
              form.get('subjectName')?.setValue(''); 
            }
          },
          {
            text: 'Guardar',
            handler: async (data) => {
              const form = formType === 'new' ? this.taskForm : this.editTaskForm;
              
              if (data.name && data.code) {
                const newSub = {
                  code: data.code.toUpperCase().trim(),
                  name: data.name,
                  professor: data.professor || 'Sin asignar'
                };
                await this.dataService.addSubject(newSub);
                form.get('subjectName')?.setValue(data.name);
                this.showToast('Materia agregada', 'success');
              } else {
                this.showToast('El código y el nombre son obligatorios', 'warning');
                form.get('subjectName')?.setValue('');
              }
            }
          }
        ]
      });
      await alert.present();
    }
  }

  // ==========================================
  // LÓGICA DE CREACIÓN NUEVA TAREA (Página principal)
  // ==========================================
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
      this.showToast('Error al guardar', 'danger');
    }
  }

  onFileSelected(event: any, type: 'new' | 'edit') {
    if (type === 'new') {
      this.selectedFile = event.target.files[0];
    } else {
      this.selectedEditFile = event.target.files[0];
    }
  }

  // ==========================================
  // FILTROS Y ESTADOS
  // ==========================================
  applyFilter(filter: string) {
    this.currentFilter = filter;
    const todayStr = new Date().toISOString().split('T')[0];
    const nextWeekDate = new Date();
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    const nextWeekStr = nextWeekDate.toISOString().split('T')[0];

    switch (filter) {
      case 'today': this.filteredTasks = this.allTasks.filter(t => t.dueDate === todayStr && !t.isCompleted); break;
      case 'week': this.filteredTasks = this.allTasks.filter(t => t.dueDate >= todayStr && t.dueDate <= nextWeekStr && !t.isCompleted); break;
      case 'pending': this.filteredTasks = this.allTasks.filter(t => !t.isCompleted); break;
      case 'completed': this.filteredTasks = this.allTasks.filter(t => t.isCompleted); break;
      default: this.filteredTasks = [...this.allTasks]; break;
    }
  }

  calculateStreak(tasks: any[]) {
    const completedDates = tasks.filter(t => t.isCompleted && t.completedDate).map(t => t.completedDate);
    const uniqueDates = [...new Set(completedDates)].sort((a, b) => b.localeCompare(a));
    if (uniqueDates.length === 0) { this.studyStreak = 0; return; }

    let streak = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);

    const todayStr = today.toISOString().split('T')[0];
    let yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
      this.studyStreak = 0; return;
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        streak++; checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === todayStr) {
        checkDate.setDate(checkDate.getDate() - 1);
      } else { break; }
    }
    this.studyStreak = streak;
  }

  async toggleComplete(task: any, event?: Event) {
    if (event) event.stopPropagation(); 
    try {
      const isNowCompleted = !task.isCompleted;
      const completedDate = isNowCompleted ? new Date().toISOString().split('T')[0] : null;
      await this.dataService.updateTask(task.id, { isCompleted: isNowCompleted, completedDate: completedDate });
    } catch (error) { this.showToast('Error al actualizar', 'danger'); }
  }

  async rateTask(task: any, event?: Event) {
    if (event) event.stopPropagation();
    
    const alert = await this.alertCtrl.create({
      header: 'Calificar Asignación',
      message: `Ingresa la calificación (0-100) para: ${task.title}`,
      inputs: [
        { name: 'grade', type: 'number', min: 0, max: 100, placeholder: 'Ej. 95', value: task.grade || '' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Guardar Nota', 
          handler: async (data) => {
            const grade = parseFloat(data.grade);
            if (grade >= 0 && grade <= 100) {
              await this.dataService.updateTask(task.id, { grade: grade });
              this.showToast('Calificación guardada con éxito', 'success');
            } else {
              this.showToast('La calificación debe estar entre 0 y 100', 'warning');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteTask(taskId: string) {
    try {
      await this.dataService.deleteTask(taskId);
      this.showToast('Tarea eliminada', 'warning');
    } catch (error) { this.showToast('Error al eliminar', 'danger'); }
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