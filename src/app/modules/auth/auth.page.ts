import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth';
// Importamos las herramientas de Firebase para guardar el perfil
import { getAuth, updateProfile } from 'firebase/auth';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: false
})
export class AuthPage implements OnInit {
  authForm: FormGroup;
  isLoginMode = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    // Agregamos los campos vacíos (la validación se activa después)
    this.authForm = this.fb.group({
      nombre: [''], 
      apellido: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    
    const nombreControl = this.authForm.get('nombre');
    const apellidoControl = this.authForm.get('apellido');

    // Lógica dinámica: Exigimos nombre y apellido SOLO en el registro
    if (this.isLoginMode) {
      nombreControl?.clearValidators();
      apellidoControl?.clearValidators();
    } else {
      nombreControl?.setValidators([Validators.required]);
      apellidoControl?.setValidators([Validators.required]);
    }
    
    nombreControl?.updateValueAndValidity();
    apellidoControl?.updateValueAndValidity();
  }

  async onSubmit() {
    if (this.authForm.invalid) return;

    const loading = await this.loadingController.create({
      message: 'Procesando...',
    });
    await loading.present();

    try {
      if (this.isLoginMode) {
        // Inicio de sesión normal
        await this.authService.login(this.authForm.value);
      } else {
        // Le pasamos al servicio el formulario completo (que ahora incluye nombre y apellido)
        await this.authService.register(this.authForm.value);
      }
      
      await loading.dismiss();
      this.router.navigateByUrl('/dashboard', { replaceUrl: true });
      
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error de autenticación:', error);
      this.showAlert('Error en el registro', error.message || 'Verifica tus datos e intenta nuevamente.');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}