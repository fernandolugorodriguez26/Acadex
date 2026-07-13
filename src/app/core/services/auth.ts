// ==========================================
// SERVICIO DE AUTENTICACIÓN
// ==========================================

import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // ==========================================
  // INYECCIÓN DE DEPENDENCIAS
  // ==========================================
  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) { }

  // ==========================================
  // INICIO DE SESIÓN
  // ==========================================
  async login({ email, password }: any) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  // ==========================================
  // REGISTRO DE NUEVO USUARIO Y PERFIL
  // ==========================================
  async register({ email, password, nombre, apellido, universidad, carrera, matricula }: any) {
    
    // 1. Creación de credenciales de autenticación
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;
    
    // 2. Actualización del nombre visible en el perfil de Firebase Auth
    if (nombre && apellido) {
      await updateProfile(user, {
        displayName: `${nombre.trim()} ${apellido.trim()}`
      });
    }

    // 3. Creación del documento del usuario en Firestore con datos iniciales
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    await setDoc(userDocRef, {
      nombre: nombre || '',
      apellido: apellido || '',
      email: email,
      universidad: universidad || '',
      carrera: carrera || '',
      matricula: matricula || '',
      notificationsEnabled: true,
      notificationDays: 2,
      notificationTime: '10:00',
      fechaCreacion: new Date()
    });
    
    return userCredential;
  }

  // ==========================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ==========================================
  async resetPassword(email: string) {
    return await sendPasswordResetEmail(this.auth, email);
  }

  // ==========================================
  // CIERRE DE SESIÓN
  // ==========================================
  logout() {
    return signOut(this.auth);
  }
}