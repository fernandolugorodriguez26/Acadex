import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { DataService } from '../../core/services/data';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth'; 
import { LoadingController, ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  tasks$: Observable<any[]> | null = null;
  subjects$: Observable<any[]> | null = null;
  allTasks: any[] = [];
  selectedDateTasks: any[] = [];
  
  allSubjects: any[] = [];
  selectedDateClasses: any[] = [];
  
  currentSelectedDate: string = '';
  userName: string = 'Estudiante'; 
  userPhoto: string = ''; 
  subjectsMap: { [key: string]: string } = {};

  // ==========================================
  // VARIABLES DEL CALENDARIO PERSONALIZADO
  // ==========================================
  currentMonth: Date = new Date();
  calendarGrid: any[] = [];
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Formulario y Modal
  editTaskForm: FormGroup;
  selectedTask: any = null;
  isModalOpen: boolean = false;
  isEditingMode: boolean = false;
  selectedEditFile: File | null = null;

  constructor(
    private authService: AuthService,
    public dataService: DataService,
    private notificationService: NotificationService,
    private router: Router,
    private auth: Auth,
    private loadingCtrl: LoadingController, 
    private toastCtrl: ToastController,
    private fb: FormBuilder,
    private alertCtrl: AlertController
  ) {
    this.currentSelectedDate = new Date().toISOString().split('T')[0];
    
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

  // Obtiene el mes en texto para el encabezado (Ej: "Julio 2026")
  get currentMonthName() {
    return `${this.monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
  }

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        if (user.displayName) this.userName = user.displayName.split(' ')[0];
        this.userPhoto = user.photoURL || ''; 

        this.tasks$ = this.dataService.getTasks();
        this.subjects$ = this.dataService.getSubjects();
        
        this.tasks$.subscribe(tasks => {
          this.allTasks = tasks;
          this.generateCalendar(); // Renderiza la cuadrícula
          this.filterTasksByDate(this.currentSelectedDate);
        });

        this.dataService.getSubjects().subscribe(subjects => {
          this.allSubjects = subjects;
          this.subjectsMap = {};
          subjects.forEach(sub => {
            if (sub.code && sub.name) this.subjectsMap[sub.code.toUpperCase()] = sub.name;
          });
          this.generateCalendar(); // Renderiza la cuadrícula
          this.filterTasksByDate(this.currentSelectedDate);
        });

      } else {
        this.router.navigateByUrl('/auth', { replaceUrl: true });
      }
    });
  }

  // ==========================================
  // LÓGICA MATEMÁTICA DEL CALENDARIO
  // ==========================================
  // ==========================================
  // LÓGICA MATEMÁTICA DEL CALENDARIO
  // ==========================================
  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // [NUEVO] Calculamos la fecha exacta de hoy
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    this.calendarGrid = [];
    let currentWeek = [];
    
    // Espacios vacíos al principio del mes
    for (let i = 0; i < firstDay; i++) currentWeek.push(null);

    // Llenado de días y validación de Tareas/Clases
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const selectedJsDay = new Date(year, month, day).getDay();
      const capacitorDay = selectedJsDay + 1; 
      
      const hasClass = this.allSubjects.some(sub => sub.dayOfWeek === capacitorDay && sub.startTime);
      const hasTask = this.allTasks.some(t => t.dueDate === dateStr && !t.isCompleted);
      
      // [NUEVO] Verificamos si este día del ciclo es hoy
      const isToday = dateStr === todayStr;

      // [ACTUALIZADO] Añadimos isToday al objeto
      currentWeek.push({ day, dateStr, hasClass, hasTask, isToday });

      if (currentWeek.length === 7) {
        this.calendarGrid.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Espacios vacíos al final del mes
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      this.calendarGrid.push(currentWeek);
    }
  }


  prevMonth() { 
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1); 
    this.generateCalendar(); 
  }
  
  nextMonth() { 
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1); 
    this.generateCalendar(); 
  }

  selectDate(dateStr: string) { 
    this.currentSelectedDate = dateStr; 
    this.filterTasksByDate(dateStr); 
  }

  // ==========================================
  // LÓGICA DE TAREAS Y MODAL
  // ==========================================
  filterTasksByDate(date: string) { 
    this.selectedDateTasks = this.allTasks.filter(task => task.dueDate === date); 
    
    const [y, m, d] = date.split('-').map(Number);
    const selectedJsDay = new Date(y, m - 1, d).getDay();
    const capacitorDay = selectedJsDay + 1; 
    
    this.selectedDateClasses = this.allSubjects.filter(sub => sub.dayOfWeek === capacitorDay && sub.startTime);
    this.selectedDateClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  cancelEditMode() {
    this.isEditingMode = false;
    this.selectedEditFile = null;
  }

  openTaskDetails(task: any) {
    if (this.isModalOpen) {
      return; 
    }
    
    this.selectedTask = task;
    this.isEditingMode = false;
    this.isModalOpen = true;
  }

  closeTaskDetails() {
    this.isModalOpen = false;
    setTimeout(() => { this.selectedTask = null; this.isEditingMode = false; }, 300);
  }

  enableEditMode() {
    if (!this.selectedTask) {
      this.showToast('No se ha seleccionado una tarea', 'warning');
      return;
    }
    
    this.editTaskForm.reset(); 
    this.editTaskForm.patchValue({
      title: this.selectedTask.title || '',
      subjectName: this.selectedTask.subjectName || '',
      dueDate: this.selectedTask.dueDate || '',
      category: this.selectedTask.category || 'Tarea',
      priority: this.selectedTask.priority || 'Media',
      notes: this.selectedTask.notes || '',
      isCompleted: this.selectedTask.isCompleted || false
    });
    this.isEditingMode = true;
  }
  
  async saveEditedTask() {
    if (this.editTaskForm.invalid) return;
    const loading = await this.loadingCtrl.create({ message: 'Actualizando...' });
    await loading.present();
    try {
      let attachmentUrl = this.selectedTask.attachmentUrl || null;
      let fileName = this.selectedTask.fileName || null;
      if (this.selectedEditFile) {
        attachmentUrl = await this.dataService.uploadTaskAttachment(this.selectedEditFile);
        fileName = this.selectedEditFile.name;
      }

      const finalTaskData = { ...this.editTaskForm.value, attachmentUrl, fileName };
      await this.dataService.updateTask(this.selectedTask.id, finalTaskData);
      await this.notificationService.scheduleTaskNotification({ id: this.selectedTask.id, ...finalTaskData });
      
      this.showToast('Actualizado con éxito', 'success');
      this.closeTaskDetails();
    } catch (e) {
      this.showToast('Error al actualizar', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  onFileSelected(event: any) { this.selectedEditFile = event.target.files[0]; }

  async deleteTaskFromModal() {
    await this.dataService.deleteTask(this.selectedTask.id);
    await this.notificationService.cancelTaskNotification({ id: this.selectedTask.id });
    this.showToast('Tarea eliminada', 'warning');
    this.closeTaskDetails();
  }

  async onSubjectChange(event: any, formType: 'edit') {
    if (event.detail.value === 'NEW_SUBJECT') {
      const alert = await this.alertCtrl.create({
        header: 'Nueva Materia',
        inputs: [{ name: 'code', placeholder: 'Código (ISW411)' }, { name: 'name', placeholder: 'Nombre' }],
        buttons: [
          { text: 'Cancelar', role: 'cancel', handler: () => this.editTaskForm.get('subjectName')?.setValue('') },
          { text: 'Guardar', handler: async (data) => {
            if (data.name && data.code) {
              await this.dataService.addSubject({ code: data.code.toUpperCase(), name: data.name });
              this.editTaskForm.get('subjectName')?.setValue(data.name);
            }
          }}
        ]
      });
      await alert.present();
    }
  }
  
  async toggleComplete(task: any, event?: Event) { 
    if (event) event.stopPropagation(); 
    const isNowCompleted = !task.isCompleted;
    await this.dataService.updateTask(task.id, { isCompleted: isNowCompleted }); 
    
    if (isNowCompleted) {
      await this.notificationService.cancelTaskNotification({ id: task.id });
    } else {
      await this.notificationService.scheduleTaskNotification({ ...task, isCompleted: isNowCompleted });
    }
  }

  getPriorityColor(priority: string): string { switch(priority) { case 'Crítica': return 'danger'; case 'Alta': return 'warning'; case 'Media': return 'primary'; case 'Baja': return 'medium'; default: return 'primary'; } }
  
  async logout() { await this.authService.logout(); this.router.navigateByUrl('/auth', { replaceUrl: true }); }
  triggerIcsUpload() { document.getElementById('ics-upload-dashboard')?.click(); }
  
  async rateTask(task: any, event?: Event) {
    if (event) event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Calificar Asignación',
      message: `Ingresa la calificación (0-100) para: ${task.title}`,
      inputs: [{ name: 'grade', type: 'number', min: 0, max: 100, placeholder: 'Ej. 95', value: task.grade || '' }],
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

  async onIcsSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const loading = await this.loadingCtrl.create({ message: 'Procesando...' });
    await loading.present();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const tasksToImport = this.parseIcsData((e.target as FileReader).result as string);
      for (const task of tasksToImport) {
        const result = await this.dataService.addTask(task);
        await this.notificationService.scheduleTaskNotification({ id: result.id, ...task });
      }
      await loading.dismiss();
      this.showToast(`Sincronizadas ${tasksToImport.length} tareas`, 'success');
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
      let title = summaryMatch ? summaryMatch[1].trim().replace('Vencimiento de ', '').replace('Espacio para colgar el ', '') : 'Asignación';
      const categoriesMatch = ev.match(/CATEGORIES:(.*)/);
      let extractedSubject = categoriesMatch ? (this.subjectsMap[categoriesMatch[1].trim().split('-')[1]?.toUpperCase()] || 'UAPA') : 'UAPA';
      let assignedPriority = 'Media'; let assignedCategory = 'Tarea';
      if (title.toLowerCase().includes('proyecto')) { assignedPriority = 'Crítica'; assignedCategory = 'Proyecto'; }
      const dtstart = ev.match(/DTSTART:(.*)/);
      let dueDate = dtstart ? `${dtstart[1].substring(0, 4)}-${dtstart[1].substring(4, 6)}-${dtstart[1].substring(6, 8)}` : '';
      if (dueDate) events.push({ title, dueDate, subjectName: extractedSubject, category: assignedCategory, priority: assignedPriority, notes: '📌 Sincronizado', isCompleted: false });
    }
    return events;
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2500, color, position: 'bottom' });
    await toast.present();
  }
}