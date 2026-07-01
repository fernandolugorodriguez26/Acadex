import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged, sendPasswordResetEmail, deleteUser, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { AlertController, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {
  nombre: string = 'Cargando...';
  apellido: string = '';
  email: string = 'cargando@acadex.com';
  photoUrl: string = '';

  universidad: string = '';
  carrera: string = '';
  matricula: string = '';

  themeMode: string = 'system';
  notificationsEnabled: boolean = true;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private storage: Storage, 
    private alertController: AlertController,
    private navCtrl: NavController,
    private toastController: ToastController
  ) {}

  // [INICIALIZACIÓN DE PERFIL]
  // Limpio configuraciones obsoletas, recupero el tema activo y sincronizo los datos 
  // del usuario tanto desde Firebase Auth como desde Firestore.
  ngOnInit() {
    localStorage.removeItem('acadex_dark_mode');
    this.themeMode = localStorage.getItem('acadex_theme') || 'system';

    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.email = user.email || '';
        
        if (user.displayName) {
          const partes = user.displayName.split(' ');
          this.nombre = partes[0] || '';
          this.apellido = partes.slice(1).join(' ') || '';
        } else {
          this.nombre = 'Estudiante';
          this.apellido = '';
        }
        
        this.photoUrl = user.photoURL || '';

        try {
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            this.universidad = data['universidad'] || '';
            this.carrera = data['carrera'] || '';
            this.matricula = data['matricula'] || '';
          }
        } catch (error) {
          console.error("Error leyendo datos del perfil:", error);
        }
      }
    });
  }

  getAvatarUrl(): string {
    if (this.photoUrl) return this.photoUrl;
    const nombreParaAvatar = this.nombre === 'Cargando...' ? 'Acadex' : this.nombre;
    return `https://ui-avatars.com/api/?name=${nombreParaAvatar}+${this.apellido}&background=3880ff&color=fff&size=150`;
  }

  // [GESTIÓN DE APARIENCIA]
  // Aplico el esquema de color seleccionado y persisto la elección en localStorage
  // para mantener la preferencia entre sesiones.
  onThemeChange(event: any) {
    this.themeMode = event.detail.value;
    localStorage.setItem('acadex_theme', this.themeMode);
    
    if (this.themeMode === 'dark') {
      document.documentElement.classList.add('ion-palette-dark');
    } else if (this.themeMode === 'light') {
      document.documentElement.classList.remove('ion-palette-dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('ion-palette-dark');
      } else {
        document.documentElement.classList.remove('ion-palette-dark');
      }
    }
  }

  // [UPLOAD Y ALMACENAMIENTO]
  // Proceso la subida de archivos a Firebase Storage, actualizando la URL en Firebase Auth
  // para reflejar el cambio de imagen de perfil de forma inmediata.
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const user = this.auth.currentUser;
    if (!user) return;

    try {
      const toastLoading = await this.toastController.create({
        message: 'Subiendo foto a Firebase Storage...',
        duration: 2000,
        color: 'tertiary'
      });
      await toastLoading.present();

      const filePath = `users/${user.uid}/profile_${Date.now()}`;
      const storageRef = ref(this.storage, filePath);

      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: downloadUrl });

      this.photoUrl = downloadUrl;
      this.showToast('¡Foto guardada con éxito en Storage!');
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      this.showAlert('Error', 'Hubo un problema subiendo el archivo a Storage.');
    }
  }

  // [SEGURIDAD Y CUENTA]
  // Lógica de reseteo de contraseña y eliminación de cuenta, cumpliendo con los estándares
  // de seguridad de Firebase al exigir sesiones recientes para acciones críticas.
  async changePassword() {
    if (!this.email) return;
    try {
      await sendPasswordResetEmail(this.auth, this.email);
      this.showAlert('Correo Enviado', 'Revisa tu bandeja de entrada para crear una nueva contraseña.');
    } catch (error: any) {
      this.showAlert('Error', 'No se pudo enviar el correo. Intenta nuevamente más tarde.');
    }
  }

  async deleteAccount() {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: 'Esta acción es irreversible y borrará tu cuenta de Acadex para siempre.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const user = this.auth.currentUser;
            if (user) {
              try {
                await deleteUser(user);
                this.navCtrl.navigateRoot('/auth'); 
              } catch (error: any) {
                this.showAlert('Atención', 'Por motivos de seguridad, debes cerrar sesión y volver a entrar antes de eliminar tu cuenta.');
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // [PERSISTENCIA DE DATOS ACADÉMICOS]
  // Sincronizo los campos del formulario con la base de datos Firestore utilizando {merge: true}
  // para actualizar solo los campos necesarios.
  async saveProfile() {
    const user = this.auth.currentUser;
    if (!user) return;

    try {
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(userDocRef, {
        universidad: this.universidad,
        carrera: this.carrera,
        matricula: this.matricula,
        ultimaActualizacion: new Date()
      }, { merge: true });

      this.showToast('Perfil actualizado correctamente');
    } catch (error) {
      console.error("Error al guardar:", error);
      this.showAlert('Error', 'Hubo un problema guardando tu perfil.');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color: 'success',
      position: 'bottom',
      icon: 'checkmark-circle'
    });
    await toast.present();
  }
}