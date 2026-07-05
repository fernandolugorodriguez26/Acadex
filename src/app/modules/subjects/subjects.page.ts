import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../core/services/data';
import { ToastController, AlertController } from '@ionic/angular';
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
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.subjectForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      professor: ['', Validators.required]
    });
  }

  ngOnInit() {
    const subjects$ = this.dataService.getSubjects();
    const tasks$ = this.dataService.getTasks();

    // =================================================================
    // MOTOR DE CÁLCULO AUTOMÁTICO (RÚBRICA UAPA)
    // =================================================================
    this.subjectsWithGrades$ = combineLatest([subjects$, tasks$]).pipe(
      map(([subjects, tasks]) => {
        return subjects.map(subject => {
          
          // 1. Filtramos solo las tareas de esta materia (completadas y con nota)
          const subjectTasks = tasks.filter(t => t.subjectName === subject.name && t.isCompleted && t.grade !== undefined);
          
          // 2. Agrupamos por categoría (Con limpieza de texto para evitar fallos por mayúsculas o espacios)
          const foros = subjectTasks.filter(t => t.category?.trim().toLowerCase() === 'foro');
          const tareas = subjectTasks.filter(t => t.category?.trim().toLowerCase() === 'tarea');
          const proyectos = subjectTasks.filter(t => t.category?.trim().toLowerCase() === 'proyecto');
          const pruebasFinales = subjectTasks.filter(t => t.category?.trim().toLowerCase() === 'prueba final');

          // 3. Calculamos el PROMEDIO de cada categoría (Base 100)
          const promForos = foros.length ? foros.reduce((a, b) => a + b.grade, 0) / foros.length : 0;
          const promTareas = tareas.length ? tareas.reduce((a, b) => a + b.grade, 0) / tareas.length : 0;
          const promProyectos = proyectos.length ? proyectos.reduce((a, b) => a + b.grade, 0) / proyectos.length : 0;
          const promPruebas = pruebasFinales.length ? pruebasFinales.reduce((a, b) => a + b.grade, 0) / pruebasFinales.length : 0;

          // 4. Aplicamos el PESO OFICIAL DE LA UAPA
          const ptosForos = promForos * 0.10;         // 10%
          const ptosTareas = promTareas * 0.20;       // 20%
          const ptosProyectos = promProyectos * 0.15; // 15%
          const ptosExamenes = promPruebas * 0.50;    // 50% (Prueba Final)
          const ptosValores = 5;                      // 5% FIJO (Actitudes y Valores)

          // 5. Total y Letra
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
      const subjectData = {
        ...this.subjectForm.value,
        code: this.subjectForm.value.code.toUpperCase().trim()
      };
      await this.dataService.addSubject(subjectData);
      this.subjectForm.reset();
      this.showToast('Materia registrada con éxito', 'success');
    } catch (error) {
      this.showToast('Error al registrar', 'danger');
    }
  }

  async confirmDelete(subjectId: string) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar materia?',
      message: 'Perderás el registro de esta materia. ¿Deseas continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.deleteSubject(subjectId) }
      ]
    });
    await alert.present();
  }

  async deleteSubject(subjectId: string) {
    try {
      await this.dataService.deleteSubject(subjectId);
      this.showToast('Materia eliminada', 'warning');
    } catch (error) { this.showToast('Error al eliminar', 'danger'); }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2500, color, position: 'bottom' });
    await toast.present();
  }
}