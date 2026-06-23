import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../core/services/data';
import { ToastController } from '@ionic/angular';
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
  subjects$: Observable<any[]> | null = null; // Lista de materias

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private toastCtrl: ToastController
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      subjectName: ['', Validators.required], // Vinculación con la materia
      dueDate: ['', Validators.required],
      isCompleted: [false]
    });
  }

  ngOnInit() {
    this.tasks$ = this.dataService.getTasks();
    this.subjects$ = this.dataService.getSubjects(); // Cargamos las materias para el selector
  }

  async addTask() {
    if (this.taskForm.invalid) return;

    try {
      await this.dataService.addTask(this.taskForm.value);
      this.taskForm.reset({ isCompleted: false, subjectName: '' });
      this.showToast('Tarea agregada exitosamente', 'success');
    } catch (error) {
      this.showToast('Error al guardar la tarea', 'danger');
    }
  }

  async toggleComplete(task: any) {
    try {
      await this.dataService.updateTask(task.id, { isCompleted: !task.isCompleted });
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