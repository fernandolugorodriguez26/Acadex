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
    // [CONFIGURACIÓN DEL FORMULARIO]
    // Estructuro el formulario para capturar los datos básicos de cada materia académica.
    this.subjectForm = this.fb.group({
      name: ['', Validators.required],
      professor: ['', Validators.required]
    });
  }

  // [INICIALIZACIÓN]
  // Obtengo el stream de datos de las materias para que la UI se mantenga actualizada en tiempo real.
  ngOnInit() {
    this.subjects$ = this.dataService.getSubjects();
  }

  // [CREACIÓN DE MATERIAS]
  // Valido el formulario y delego la persistencia al servicio de datos.
  async addSubject() {
    if (this.subjectForm.invalid) return;

    try {
      await this.dataService.addSubject(this.subjectForm.value);
      this.subjectForm.reset();
      this.showToast('Materia registrada con éxito', 'success');
    } catch (error) {
      this.showToast('Error al registrar la materia', 'danger');
    }
  }

  // [ELIMINACIÓN SEGURA]
  // Implemento un patrón de confirmación antes de ejecutar operaciones destructivas.
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

  // [OPERACIÓN DE BORRADO]
  // Ejecuto la baja de la materia en la base de datos y notifico al usuario.
  async deleteSubject(subjectId: string) {
    try {
      await this.dataService.deleteSubject(subjectId);
      this.showToast('Materia eliminada', 'warning');
    } catch (error) {
      this.showToast('Error al eliminar', 'danger');
    }
  }

  // [UX FEEDBACK]
  // Centralizo la gestión de mensajes tipo Toast para uniformizar las notificaciones.
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