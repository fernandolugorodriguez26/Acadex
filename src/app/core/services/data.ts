// ==========================================
// SERVICIO DE GESTIÓN DE DATOS (FIRESTORE & STORAGE)
// ==========================================

import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where, addDoc, doc, updateDoc, deleteDoc, getDocs } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // ==========================================
  // INYECCIÓN DE DEPENDENCIAS
  // ==========================================
  constructor(
    private firestore: Firestore, 
    private auth: Auth,
    private storage: Storage
  ) { }

  // ==========================================
  // AUTENTICACIÓN
  // ==========================================
  
  // Obtener ID del usuario con sesión activa
  private get userId() {
    return this.auth.currentUser?.uid;
  }

  // ==========================================
  // GESTIÓN DE TAREAS
  // ==========================================
  
  // Obtener lista de tareas del usuario
  getTasks(): Observable<any[]> {
    const tasksRef = collection(this.firestore, 'tasks');
    const q = query(tasksRef, where('userId', '==', this.userId));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  // Crear nueva tarea
  addTask(task: any) {
    const tasksRef = collection(this.firestore, 'tasks');
    return addDoc(tasksRef, { ...task, userId: this.userId, createdAt: new Date() });
  }

  // Actualizar tarea existente
  updateTask(taskId: string, data: any) {
    const taskDocRef = doc(this.firestore, `tasks/${taskId}`);
    return updateDoc(taskDocRef, data);
  }

  // Eliminar tarea
  deleteTask(taskId: string) {
    const taskDocRef = doc(this.firestore, `tasks/${taskId}`);
    return deleteDoc(taskDocRef);
  }

  // Eliminar todas las tareas asociadas a una materia específica
  async deleteTasksBySubject(subjectName: string) {
    const tasksRef = collection(this.firestore, 'tasks');
    const q = query(tasksRef, where('userId', '==', this.userId), where('subjectName', '==', subjectName));
    const snapshot = await getDocs(q);
    
    const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(this.firestore, `tasks/${docSnap.id}`)));
    return Promise.all(deletePromises);
  }

  // Subir archivo adjunto de una tarea a Storage
  async uploadTaskAttachment(file: File): Promise<string> {
    if (!this.userId) throw new Error('Usuario no autenticado');
    const filePath = `tasks_attachments/${this.userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);
    
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  // ==========================================
  // GESTIÓN DE MATERIAS Y CALIFICACIONES
  // ==========================================
  
  // Obtener lista de materias del usuario
  getSubjects(): Observable<any[]> {
    const subRef = collection(this.firestore, 'subjects');
    const q = query(subRef, where('userId', '==', this.userId));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  // Registrar nueva materia
  addSubject(subject: any) {
    const subRef = collection(this.firestore, 'subjects');
    return addDoc(subRef, { ...subject, userId: this.userId });
  }

  // Actualizar materia o guardar calificaciones
  updateSubject(subjectId: string, data: any) {
    const subRef = doc(this.firestore, `subjects/${subjectId}`);
    return updateDoc(subRef, data);
  }

  // Eliminar materia
  deleteSubject(subjectId: string) {
    const subRef = doc(this.firestore, `subjects/${subjectId}`);
    return deleteDoc(subRef);
  }
}
