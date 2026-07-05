import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../core/services/data';
import { ToastController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.page.html',
  styleUrls: ['./subjects.page.scss'],
  standalone: false
})
export class SubjectsPage implements OnInit {
  subjectForm: FormGroup;
  subjects$: Observable<any[]> | null = null;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.subjectForm = this.fb.group({
      code: ['', Validators.required], // NUEVO: Código de la materia
      name: ['', Validators.required],
      professor: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.subjects$ = this.dataService.getSubjects();
  }

  async addSubject() {
    if (this.subjectForm.invalid) return;

    try {
      // Aseguramos que el código se guarde siempre en mayúsculas para evitar errores
      const subjectData = {
        ...this.subjectForm.value,
        code: this.subjectForm.value.code.toUpperCase().trim()
      };

      await this.dataService.addSubject(subjectData);
      this.subjectForm.reset();
      this.showToast('Materia registrada con éxito', 'success');
    } catch (error) {
      this.showToast('Error al registrar la materia', 'danger');
    }
  }

  async confirmDelete(subjectId: string) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar materia?',
      message: 'Las tareas asociadas a esta materia quedarán sin asignatura. ¿Deseas continuar?',
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
    } catch (error) {
      this.showToast('Error al eliminar', 'danger');
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}