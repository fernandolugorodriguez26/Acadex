import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth';
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
    // [ESTADO INICIAL]
    // Inicializo el formulario. Solo defino email y password como requeridos al cargar la vista.
    this.authForm = this.fb.group({
      nombre: [''], 
      apellido: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  // [VALIDACIÓN DINÁMICA]
  // Al alternar entre Login y Registro, activo o desactivo la obligatoriedad de nombre y apellido.
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    
    const nombreControl = this.authForm.get('nombre');
    const apellidoControl = this.authForm.get('apellido');

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

  // [PROCESAMIENTO Y RUTEO]
  // Ejecuto la petición a Firebase. Si es exitosa, bloqueo el botón de retroceso usando replaceUrl.
  async onSubmit() {
    if (this.authForm.invalid) return;

    const loading = await this.loadingController.create({
      message: 'Procesando...',
    });
    await loading.present();

    try {
      if (this.isLoginMode) {
        await this.authService.login(this.authForm.value);
      } else {
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

  // [UI HANDLER]
  // Centralizo la creación de alertas para mantener limpios los bloques try/catch.
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}