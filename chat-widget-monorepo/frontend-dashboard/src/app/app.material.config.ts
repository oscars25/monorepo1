import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideMatomo } from '@ngx-matomo/tracker';

// Configuración de Material
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideMatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(), 
    provideAnimationsAsync(),
    provideHttpClient(),

    // Configuración de Material
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'fill',
      },
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        hasBackdrop: true,
        disableClose: false,
      },
    },

    provideMatIconRegistry((registry) => {
      registry.addSvgIconSetInNamespace(
        'custom',
        'assets/icons/custom-icons.svg'
      );
      registry.addSvgIcon(
        'chat',
        'assets/icons/chat.svg'
      );
      registry.addSvgIcon(
        'close',
        'assets/icons/close.svg'
      );
      registry.addSvgIcon(
        'fullscreen',
        'assets/icons/fullscreen.svg'
      );
      registry.addSvgIcon(
        'fullscreen_exit',
        'assets/icons/fullscreen_exit.svg'
      );
    }),
  ]
};
