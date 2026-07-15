package io.ionic.starter; // <-- Deja tu paquete original aquí, no lo borres

import android.os.Bundle;
import android.view.View; // <-- Asegúrate de tener esta importación
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Puedes agregar más inicializaciones aquí si las necesitas en el futuro
  }

  // Este evento se dispara cada vez que la app toma el control de la pantalla
  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus) {
      activarModoInmersivo();
    }
  }

  // Configuración nativa para ocultar las barras del sistema
  private void activarModoInmersivo() {
    getWindow().getDecorView().setSystemUiVisibility(
      View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION  // <--- Oculta los botones inferiores
        | View.SYSTEM_UI_FLAG_FULLSCREEN       // <--- Oculta la barra de estado superior (Hora/Batería)
        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY // <--- Los oculta automáticamente al deslizar
    );
  }
}
