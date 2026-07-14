import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data';
import { Observable } from 'rxjs';

// Configuración del Componente
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: false
})
export class CalendarPage implements OnInit {
  
  // Variables de Estado
  tasks$: Observable<any[]> | null = null;
  allTasks: any[] = [];
  selectedDateTasks: any[] = [];
  highlightedDates: any[] = []; 

  // Inyección de Servicios
  constructor(private dataService: DataService) {}

  // Suscripción de Datos y Generación de Marcadores
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

  // Filtrado Local por Fecha Seleccionada
  onDateChange(event: any) {
    const selectedDate = event.detail.value.split('T')[0];
    this.selectedDateTasks = this.allTasks.filter(task => task.dueDate === selectedDate);
  }
}