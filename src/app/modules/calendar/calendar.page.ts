import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: false
})
export class CalendarPage implements OnInit {
  tasks$: Observable<any[]> | null = null;
  allTasks: any[] = [];
  selectedDateTasks: any[] = [];
  highlightedDates: any[] = []; // Aquí guardaremos los días a resaltar

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.tasks$ = this.dataService.getTasks();
    
    // Nos suscribimos a los datos para procesar las fechas
    this.tasks$.subscribe(tasks => {
      this.allTasks = tasks;
      
      // Creamos el arreglo de fechas resaltadas para el calendario de Ionic
      this.highlightedDates = tasks.map(task => ({
        date: task.dueDate,
        textColor: '#ffffff',
        backgroundColor: '#3880ff' // Color azul principal de Acadex
      }));
    });
  }

  // Se ejecuta cada vez que el estudiante toca un día en el calendario
  onDateChange(event: any) {
    // Limpiamos la fecha para que coincida con el formato de la base de datos (YYYY-MM-DD)
    const selectedDate = event.detail.value.split('T')[0];
    
    // Filtramos las tareas que coincidan exactamente con ese día
    this.selectedDateTasks = this.allTasks.filter(task => task.dueDate === selectedDate);
  }
}
