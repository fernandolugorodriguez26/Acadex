import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth';

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
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

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
      this.showAlert('Error', 'Verifica tus credenciales e intenta nuevamente.');
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