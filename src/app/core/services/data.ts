import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private firestore: Firestore, private auth: Auth) { }

  private get userId() {
    return this.auth.currentUser?.uid;
  }

  // ================= TAREAS =================
  getTasks(): Observable<any[]> {
    const tasksRef = collection(this.firestore, 'tasks');
    const q = query(tasksRef, where('userId', '==', this.userId));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  addTask(task: any) {
    const tasksRef = collection(this.firestore, 'tasks');
    return addDoc(tasksRef, { ...task, userId: this.userId });
  }

  updateTask(taskId: string, data: any) {
    const taskDocRef = doc(this.firestore, `tasks/${taskId}`);
    return updateDoc(taskDocRef, data);
  }

  deleteTask(taskId: string) {
    const taskDocRef = doc(this.firestore, `tasks/${taskId}`);
    return deleteDoc(taskDocRef);
  }

  // ================= MATERIAS =================
  getSubjects(): Observable<any[]> {
    const subRef = collection(this.firestore, 'subjects');
    const q = query(subRef, where('userId', '==', this.userId));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  addSubject(subject: any) {
    const subRef = collection(this.firestore, 'subjects');
    return addDoc(subRef, { ...subject, userId: this.userId });
  }

  deleteSubject(subjectId: string) {
    const subRef = doc(this.firestore, `subjects/${subjectId}`);
    return deleteDoc(subRef);
  }
}