import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) { }

  async login({ email, password }: any) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async register({ email, password, nombre, apellido }: any) {
    // 1. AngularFire crea el usuario
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    
    // 2. Inmediatamente después, le inyectamos el nombre al perfil usando la misma conexión
    if (nombre && apellido) {
      await updateProfile(userCredential.user, {
        displayName: `${nombre.trim()} ${apellido.trim()}`
      });
    }
    
    return userCredential;
  }

  logout() {
    return signOut(this.auth);
  }
}