import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { DataService } from '../../core/services/data';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth'; 
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  tasks$: Observable<any[]> | null = null;
  allTasks: any[] = [];
  selectedDateTasks: any[] = [];
  highlightedDates: any[] = [];
  currentSelectedDate: string = '';
  
  userName: string = 'Estudiante'; 
  userPhoto: string = ''; 
  subjectsMap: { [key: string]: string } = {};

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private auth: Auth,
    private loadingCtrl: LoadingController, 
    private toastCtrl: ToastController      
  ) {
    this.currentSelectedDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        if (user.displayName) {
          this.userName = user.displayName.split(' ')[0];
        }
        this.userPhoto = user.photoURL || ''; 

        this.tasks$ = this.dataService.getTasks();
        
        this.tasks$.subscribe(tasks => {
          this.allTasks = tasks;
          this.highlightedDates = tasks.map(task => ({
            date: task.dueDate,
            textColor: '#ffffff',
            backgroundColor: '#3880ff'
          }));
          this.filterTasksByDate(this.currentSelectedDate);
        });

        this.dataService.getSubjects().subscribe(subjects => {
          this.subjectsMap = {};
          subjects.forEach(sub => {
            if (sub.code && sub.name) {
              this.subjectsMap[sub.code.toUpperCase()] = sub.name;
            }
          });
        });

      } else {
        this.router.navigateByUrl('/auth', { replaceUrl: true });
      }
    });
  }

  onDateChange(event: any) {
    this.currentSelectedDate = event.detail.value.split('T')[0];
    this.filterTasksByDate(this.currentSelectedDate);
  }

  filterTasksByDate(date: string) {
    this.selectedDateTasks = this.allTasks.filter(task => task.dueDate === date);
  }

  async toggleComplete(task: any) {
    try {
      await this.dataService.updateTask(task.id, { isCompleted: !task.isCompleted });
    } catch (error) {
      console.error('Error al actualizar el estado de la tarea:', error);
    }
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

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/auth', { replaceUrl: true });
  }

  // ==========================================
  // IMPORTADOR DE MOODLE (.ics) EN DASHBOARD
  // ==========================================
  triggerIcsUpload() {
    document.getElementById('ics-upload-dashboard')?.click();
  }

  async onIcsSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const loading = await this.loadingCtrl.create({ message: 'Procesando calendario de UAPA...' });
    await loading.present();

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = (e.target as FileReader).result as string;
      const tasksToImport = this.parseIcsData(text);

      if (tasksToImport.length === 0) {
        await loading.dismiss();
        this.showToast('No se encontraron tareas legibles en el archivo.', 'warning');
        return;
      }

      try {
        for (const task of tasksToImport) {
          await this.dataService.addTask(task);
        }
        await loading.dismiss();
        this.showToast(`¡Éxito! ${tasksToImport.length} tareas sincronizadas`, 'success');
      } catch (error) {
        await loading.dismiss();
        this.showToast('Error al guardar las tareas importadas', 'danger');
      }
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
      let title = summaryMatch ? summaryMatch[1].trim() : 'Asignación Importada';
      title = title.replace('Vencimiento de ', '').replace('Espacio para colgar el ', '').trim();

      // ==================================================
      // BÚSQUEDA DINÁMICA EN EL DICCIONARIO DE FIREBASE
      // ==================================================
      const categoriesMatch = ev.match(/CATEGORIES:(.*)/);
      let extractedSubject = 'UAPA'; 
      
      if (categoriesMatch) {
        const catStr = categoriesMatch[1].trim(); 
        const parts = catStr.split('-');
        if (parts.length >= 2) {
          const subjectCode = parts[1].toUpperCase(); 
          
          // ¡MAGIA!: Busca en la lista de materias que tú mismo creaste en la app
          extractedSubject = this.subjectsMap[subjectCode] || subjectCode; 
        } else {
          extractedSubject = catStr; 
        }
      }

      let assignedPriority = 'Media'; 
      let assignedCategory = 'Tarea'; 
      const titleLower = title.toLowerCase();

      if (titleLower.includes('proyecto') || titleLower.includes('proeycto') || titleLower.includes('trabajo final') || titleLower.includes('investigación final')) {
        assignedPriority = 'Crítica';
        assignedCategory = 'Proyecto';
      } 
      else if (titleLower.includes('examen') || titleLower.includes('cuestionario') || titleLower.includes('prueba') || titleLower.includes('evaluación') || titleLower.includes('evaluacion')) {
        assignedPriority = 'Alta';
        assignedCategory = 'Examen';
      }
      else if (titleLower.includes('foro') || titleLower.includes('debate') || titleLower.includes('tarea')) {
        assignedPriority = 'Media';
        assignedCategory = 'Tarea';
      }
      else if (titleLower.includes('lectura') || titleLower.includes('material') || titleLower.includes('recurso')) {
        assignedPriority = 'Baja';
        assignedCategory = 'Lectura';
      }

      const dtstartMatch = ev.match(/DTSTART:(.*)/);
      let dueDate = '';
      if (dtstartMatch) {
        const rawDate = dtstartMatch[1].trim();
        if (rawDate.length >= 8) {
          dueDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;
        }
      }

      if (dueDate) {
        events.push({
          title: title,
          dueDate: dueDate,
          subjectName: extractedSubject, // Asigna el nombre real de tu base de datos
          category: assignedCategory,
          priority: assignedPriority,
          notes: '📌 Sincronizado automáticamente desde el calendario universitario.',
          isCompleted: false
        });
      }
    }
    return events;
  }
  // ==========================================
  // FEEDBACK DE USUARIO (TOAST)
  // ==========================================
  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ 
      message, 
      duration: 2500, 
      color, 
      position: 'bottom' 
    });
    await toast.present();
  }
}