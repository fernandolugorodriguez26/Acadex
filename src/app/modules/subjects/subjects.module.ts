import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <-- Añadir esto

import { IonicModule } from '@ionic/angular';

import { SubjectsPageRoutingModule } from './subjects-routing.module';
import { SubjectsPage } from './subjects.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SubjectsPageRoutingModule
  ],
  declarations: [SubjectsPage]
})
export class SubjectsPageModule {}