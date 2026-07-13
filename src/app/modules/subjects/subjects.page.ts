import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../core/services/data';
import { NotificationService } from '../../core/services/notification.service'; // [NUEVO] Motor de Alarmas
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.page.html',
  styleUrls: ['./subjects.page.scss'],
  standalone: false
})
export class SubjectsPage implements OnInit {
  subjectForm: FormGroup;
  subjectsWithGrades$: Observable<any[]> | null = null;
  
  isGradeModalOpen = false;
  selectedSubject: any = null;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private notificationService: NotificationService, // [NUEVO] Inyectado
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
    this.subjectForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      professor: ['', Validators.required],
      // [NUEVO] Campos de Horario
      dayOfWeek: [null], 
      startTime: [''], 
      endTime: ['']
    });
  }

  ngOnInit() {
    const subjects$ = this.dataService.getSubjects();
    const tasks$ = this.dataService.getTasks();

    this.subjectsWithGrades$ = combineLatest([subjects$, tasks$]).pipe(
      map(([subjects, tasks]) => {
        return subjects.map(subject => {
          
          const subjectTasks = tasks.filter(t => t.subjectName === subject.name && t.isCompleted && t.grade !== undefined);
          
          const foros = subjectTasks.filter(t => t.category?.trim().toLowerCase() === 'foro');
          const tareas = subjectTasks.filter(t => t.category?.trim().toLowerCase() === 'tarea');
          const proyectos = subjectTasks.filter(t => t.category?.trim().toLowerCase() === 'proyecto');
          const pruebasFinales = subjectTasks.filter(t => t.category?.trim().toLowerCase() === 'prueba final');

          const promForos = foros.length ? foros.reduce((a, b) => a + b.grade, 0) / foros.length : 0;
          const promTareas = tareas.length ? tareas.reduce((a, b) => a + b.grade, 0) / tareas.length : 0;
          const promProyectos = proyectos.length ? proyectos.reduce((a, b) => a + b.grade, 0) / proyectos.length : 0;
          const promPruebas = pruebasFinales.length ? pruebasFinales.reduce((a, b) => a + b.grade, 0) / pruebasFinales.length : 0;

          const ptosForos = promForos * 0.10;         
          const ptosTareas = promTareas * 0.20;       
          const ptosProyectos = promProyectos * 0.15; 
          const ptosExamenes = promPruebas * 0.50;    
          const ptosValores = 5;                      

          const totalScore = Math.round(ptosForos + ptosTareas + ptosProyectos + ptosExamenes + ptosValores);
          let letterGrade = 'F';
          if (totalScore >= 90) letterGrade = 'A';
          else if (totalScore >= 80) letterGrade = 'B';
          else if (totalScore >= 70) letterGrade = 'C';
          else if (totalScore >= 60) letterGrade = 'D';

          return {
            ...subject,
            breakdown: { ptosForos, ptosTareas, ptosProyectos, ptosExamenes, ptosValores },
            tasksCount: subjectTasks.length,
            totalScore,
            letterGrade
          };
        });
      })
    );
  }

  // [NUEVO] Utilidad para mostrar el nombre del día en la lista
  getDayName(day: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[day - 1] || '';
  }

  openGradeModal(subject: any) {
    this.selectedSubject = subject;
    this.isGradeModalOpen = true;
  }

  closeGradeModal() {
    this.isGradeModalOpen = false;
    this.selectedSubject = null;
  }

  async addSubject() {
    if (this.subjectForm.invalid) return;
    try {
      let dayValue = this.subjectForm.value.dayOfWeek;
      if (dayValue) dayValue = parseInt(dayValue, 10);

      const subjectData = {
        ...this.subjectForm.value,
        dayOfWeek: dayValue,
        code: this.subjectForm.value.code.toUpperCase().trim()
      };
      
      const result = await this.dataService.addSubject(subjectData);
      
      // [NUEVO] Programar alarma si la materia tiene un horario definido
      if (subjectData.dayOfWeek && subjectData.startTime) {
        await this.notificationService.scheduleClassNotification({ 
          id: result?.id || subjectData.code, 
          ...subjectData 
        });
      }

      this.subjectForm.reset();
      this.showToast('Materia registrada con éxito', 'success');
    } catch (error) {
      this.showToast('Error al registrar', 'danger');
    }
  }

  async confirmDelete(subject: any) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar materia?',
      message: `Se eliminará la materia "${subject.name}" junto con todas sus tareas, notas y foros. Esta acción es definitiva. ¿Deseas continuar?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar todo', role: 'destructive', handler: () => this.deleteSubject(subject) }
      ]
    });
    await alert.present();
  }

  async deleteSubject(subject: any) {
    const loading = await this.loadingCtrl.create({ message: 'Eliminando materia y tareas...' });
    await loading.present();

    try {
      await this.dataService.deleteTasksBySubject(subject.name);
      await this.dataService.deleteSubject(subject.id);
      
      // [NUEVO] Borrar la alarma recurrente del teléfono
      await this.notificationService.cancelClassNotification(subject);
      
      this.showToast('Materia y tareas eliminadas correctamente', 'warning');
      this.closeGradeModal(); 
    } catch (error) { 
      this.showToast('Error al eliminar los datos', 'danger'); 
    } finally {
      await loading.dismiss();
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2500, color, position: 'bottom' });
    await toast.present();
  }
}