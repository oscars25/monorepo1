import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { User } from '../../../../services/auth.service';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="userForm" (ngSubmit)="saveUser()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Usuario</mat-label>
          <input matInput formControlName="username" required>
          <mat-error *ngIf="userForm.get('username')?.hasError('required')">
            El usuario es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" required>
          <mat-error *ngIf="userForm.get('email')?.hasError('required')">
            El email es requerido
          </mat-error>
          <mat-error *ngIf="userForm.get('email')?.hasError('email')">
            El email no es válido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Nombre Completo</mat-label>
          <input matInput formControlName="fullName" required>
          <mat-error *ngIf="userForm.get('fullName')?.hasError('required')">
            El nombre completo es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Rol</mat-label>
          <mat-select formControlName="role" required>
            <mat-option value="ADMIN">Administrador</mat-option>
            <mat-option value="AGENT">Agente</mat-option>
          </mat-select>
          <mat-error *ngIf="userForm.get('role')?.hasError('required')">
            El rol es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width" *ngIf="!data.isEditing">
          <mat-label>Contraseña</mat-label>
          <input matInput type="password" formControlName="password" required>
          <mat-error *ngIf="userForm.get('password')?.hasError('required')">
            La contraseña es requerida
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-button color="primary" (click)="saveUser()" [disabled]="userForm.invalid">
        {{ data.isEditing ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      isEditing: boolean; 
      selectedUser: User | null;
      userService: any;
    }
  ) {
    this.userForm = this.fb.group({
      id: [null],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      role: ['', Validators.required],
      password: ['']
    });
  }

  ngOnInit(): void {
    if (this.data.isEditing && this.data.selectedUser) {
      this.userForm.patchValue({
        id: this.data.selectedUser.id,
        username: this.data.selectedUser.username,
        email: this.data.selectedUser.email,
        fullName: this.data.selectedUser.fullName,
        role: this.data.selectedUser.role,
        password: ''
      });
    } else {
      this.userForm.patchValue({
        role: 'AGENT'
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  saveUser(): void {
    if (this.userForm.invalid) return;

    this.dialogRef.close(this.userForm.value);
  }
}
