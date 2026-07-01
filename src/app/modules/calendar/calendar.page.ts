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
  highlightedDates: any[] = []; 

  constructor(private dataService: DataService) {}

  // [SUBSCRIPCIÓN Y MAPEO]
  // Obtengo el flujo de tareas desde la base de datos y genero dinámicamente 
  // los marcadores visuales (puntos azules) requeridos por el componente de calendario.
  ngOnInit() {
    this.tasks$ = this.dataService.getTasks();
    
    this.tasks$.subscribe(tasks => {
      this.allTasks = tasks;
      
      this.highlightedDates = tasks.map(task => ({
        date: task.dueDate,
        textColor: '#ffffff',
        backgroundColor: '#3880ff'
      }));
    });
  }

  // [FILTRO DE UI]
  // Capturo el evento de selección del calendario, extraigo solo la fecha en formato ISO (YYYY-MM-DD)
  // y filtro localmente el arreglo para mostrar únicamente las entregas de ese día.
  onDateChange(event: any) {
    const selectedDate = event.detail.value.split('T')[0];
    this.selectedDateTasks = this.allTasks.filter(task => task.dueDate === selectedDate);
  }
}