import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { ToastController, LoadingController, NavController, AlertController } from '@ionic/angular'; 

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: false
})
export class AuthPage implements OnInit {
  authForm: FormGroup;
  isLoginMode: boolean = true; 

  showPassword = false;
  showConfirmPassword = false;

  emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: [''],
      nombre: [''],
      apellido: [''],
      universidad: [''],
      carrera: [''],
      matricula: ['']
    }, { validators: this.passwordMatchValidator }); 
  }

  ngOnInit() {}

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!password || !confirmPassword) return null;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.authForm.reset();
    
    const camposRegistro = ['confirmPassword', 'nombre', 'apellido'];

    if (!this.isLoginMode) {
      camposRegistro.forEach(campo => this.authForm.get(campo)?.setValidators([Validators.required]));
    } else {
      camposRegistro.forEach(campo => this.authForm.get(campo)?.clearValidators());
    }
    
    camposRegistro.forEach(campo => this.authForm.get(campo)?.updateValueAndValidity());
  }

  togglePasswordVisibility(target: 'pass' | 'confirm') {
    if (target === 'pass') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  // [ACTUALIZADO] Alerta moderna y estilizada
  async forgotPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Recuperar Contraseña',
      message: 'Ingresa tu correo y te enviaremos un enlace seguro para restablecerla.',
      mode: 'ios', // Obliga bordes redondeados y estilo premium
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'ejemplo@uapa.edu.do'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar Enlace',
          handler: async (data) => {
            if (data.email) {
              try {
                await this.authService.resetPassword(data.email);
                this.showToast('Correo de recuperación enviado.', 'success', 'mail-unread');
              } catch (error: any) {
                const friendlyMessage = this.getFriendlyErrorMessage(error.code);
                this.showToast(friendlyMessage, 'danger', 'alert-circle');
              }
            } else {
              this.showToast('Por favor, ingresa un correo válido.', 'warning', 'warning');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async onSubmit() {
    if (this.authForm.invalid) return;

    const formValues = this.authForm.value;
    
    // Spinner moderno de carga
    const loading = await this.loadingCtrl.create({
      message: this.isLoginMode ? 'Iniciando sesión...' : 'Preparando tu espacio...',
      spinner: 'crescent',
      mode: 'ios'
    });
    await loading.present();

    try {
      if (this.isLoginMode) {
        await this.authService.login({ email: formValues.email, password: formValues.password });
        this.navCtrl.navigateRoot('/dashboard'); 
      } else {
        await this.authService.register({
          email: formValues.email,
          password: formValues.password,
          nombre: formValues.nombre,
          apellido: formValues.apellido,
          universidad: formValues.universidad,
          carrera: formValues.carrera,
          matricula: formValues.matricula
        });
        // [ACTUALIZADO] Toast de éxito con ícono
        this.showToast('¡Cuenta creada con éxito! Bienvenido a Acadex.', 'success', 'checkmark-circle');
        this.navCtrl.navigateRoot('/dashboard'); 
      }
    } catch (error: any) {
      console.error(error);
      const friendlyMessage = this.getFriendlyErrorMessage(error.code);
      // [ACTUALIZADO] Toast de error con ícono
      this.showToast(friendlyMessage, 'danger', 'alert-circle');
    } finally {
      await loading.dismiss();
    }
  }

  getFriendlyErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
      case 'auth/email-already-in-use':
        return 'Este correo ya está registrado en Acadex.';
      case 'auth/weak-password':
        return 'La contraseña es muy débil (Mínimo 6 caracteres).';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      case 'auth/network-request-failed':
        return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Cuenta bloqueada temporalmente.';
      default:
        return 'Hubo un inconveniente inesperado. Intenta otra vez.';
    }
  }

  // [ACTUALIZADO] Toasts superiores estilo notificaciones Push
  async showToast(message: string, color: string, icon: string = 'information-circle') {
    const toast = await this.toastCtrl.create({ 
      message, 
      duration: 3500, 
      color, 
      position: 'top', 
      icon: icon,
      mode: 'ios',
      cssClass: 'modern-toast',
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}