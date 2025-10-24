import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../services/auth.service';
import { ChatSessionService, ChatSession } from '../../../services/chat-session.service';
import { MessageService, Message } from '../../../services/message.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../../header/header.component';
import { UserDialogComponent } from './user-dialog/user-dialog.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatTabsModule,
    MatListModule,
    MatExpansionModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    UserDialogComponent
  ],
  providers: [],
  template: `
    <app-header [user]="user" (logout)="logout()"></app-header>

    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Panel de Administración</h1>
        <p>Administra usuarios y mensajes del sistema</p>
      </div>

      <div class="dashboard-content">
        <mat-tab-group>
          <!-- Pestaña de Gestión de Usuarios -->
          <mat-tab label="Gestión de Usuarios">
            <div class="actions-bar">
              <button mat-raised-button color="primary" (click)="openUserDialog()">
                <mat-icon>person_add</mat-icon>
                Nuevo Usuario
              </button>
            </div>

            <mat-card>
              <mat-card-header>
                <mat-card-title>Lista de Usuarios</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div *ngIf="loading" class="loading">
                  <mat-spinner></mat-spinner>
                </div>

                <div *ngIf="!loading && users.length === 0" class="empty-state">
                  <p>No hay usuarios en el sistema.</p>
                </div>

                <div *ngIf="!loading && users.length > 0">
                  <mat-table [dataSource]="users">
                    <ng-container matColumnDef="id">
                      <mat-header-cell *matHeaderCellDef>ID</mat-header-cell>
                      <mat-cell *matCellDef="let user">{{ user.id }}</mat-cell>
                    </ng-container>

                    <ng-container matColumnDef="username">
                      <mat-header-cell *matHeaderCellDef>Usuario</mat-header-cell>
                      <mat-cell *matCellDef="let user">{{ user.username }}</mat-cell>
                    </ng-container>

                    <ng-container matColumnDef="email">
                      <mat-header-cell *matHeaderCellDef>Email</mat-header-cell>
                      <mat-cell *matCellDef="let user">{{ user.email }}</mat-cell>
                    </ng-container>

                    <ng-container matColumnDef="fullName">
                      <mat-header-cell *matHeaderCellDef>Nombre</mat-header-cell>
                      <mat-cell *matCellDef="let user">{{ user.fullName }}</mat-cell>
                    </ng-container>

                    <ng-container matColumnDef="role">
                      <mat-header-cell *matHeaderCellDef>Rol</mat-header-cell>
                      <mat-cell *matCellDef="let user">
                        <mat-chip [color]="getRoleColor(user.role)">{{ user.role }}</mat-chip>
                      </mat-cell>
                    </ng-container>

                    <ng-container matColumnDef="actions">
                      <mat-header-cell *matHeaderCellDef>Acciones</mat-header-cell>
                      <mat-cell *matCellDef="let user">
                        <button mat-icon-button color="primary" (click)="editUser(user)" title="Editar">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" (click)="deleteUser(user.id)" title="Eliminar">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </mat-cell>
                    </ng-container>

                    <mat-header-row *matHeaderRowDef="['id', 'username', 'email', 'fullName', 'role', 'actions']"></mat-header-row>
                    <mat-row *matRowDef="let row; columns: ['id', 'username', 'email', 'fullName', 'role', 'actions'];"></mat-row>
                  </mat-table>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-tab>

          <!-- Pestaña de Mensajes -->
          <mat-tab label="Mensajes">
            <div class="messages-container">
              <div class="sessions-section">
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Sesiones Activas</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div *ngIf="loadingSessions" class="loading">
                      <mat-spinner></mat-spinner>
                    </div>

                    <div *ngIf="!loadingSessions && sessions.length === 0" class="empty-state">
                      <p>No hay sesiones activas.</p>
                    </div>

                    <div *ngIf="!loadingSessions && sessions.length > 0">
                      <mat-accordion>
                        <mat-expansion-panel *ngFor="let session of sessions" (opened)="loadMessages(session.id)">
                          <mat-expansion-panel-header>
                            <mat-panel-title>
                              {{ session.visitorName }}
                            </mat-panel-title>
                            <mat-panel-description>
                              {{ session.visitorEmail }} - {{ session.status }}
                            </mat-panel-description>
                          </mat-expansion-panel-header>

                          <div *ngIf="loadingMessages[session.id]" class="loading">
                            <mat-spinner diameter="30"></mat-spinner>
                          </div>

                          <div *ngIf="!loadingMessages[session.id] && messages[session.id] && messages[session.id].length > 0">
                            <mat-list>
                              <mat-list-item *ngFor="let message of messages[session.id]">
                                <div matLine>{{ message.content }}</div>
                                <div matLine class="message-meta">
                                  <span class="message-author">{{ message.user.fullName || message.user.username }}</span>
                                  <span class="message-date">{{ formatDate(message.createdAt) }}</span>
                                </div>
                                <mat-icon [color]="message.isFromAgent ? 'primary' : 'accent'">
                                  {{ message.isFromAgent ? 'support_agent' : 'person' }}
                                </mat-icon>
                              </mat-list-item>
                            </mat-list>
                          </div>

                          <div *ngIf="!loadingMessages[session.id] && (!messages[session.id] || messages[session.id].length === 0)" class="empty-state">
                            <p>No hay mensajes en esta sesión.</p>
                          </div>
                        </mat-expansion-panel>
                      </mat-accordion>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <!-- Diálogo para crear/editar usuario -->
  `,
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  @Input() user: any;
  users: User[] = [];
  loading = true;
  error: string | null = null;
  displayedColumns: string[] = ['id', 'username', 'email', 'fullName', 'role', 'actions'];

  // Formulario de usuario
  userForm: FormGroup;
  isEditing = false;
  selectedUser: User | null = null;
  dialogRef: MatDialogRef<UserDialogComponent> | null = null;

  // Datos de sesiones y mensajes
  sessions: ChatSession[] = [];
  loadingSessions = true;
  messages: { [sessionId: string]: Message[] } = {};
  loadingMessages: { [sessionId: string]: boolean } = {};

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private chatSessionService: ChatSessionService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.user = this.authService.getCurrentUser();

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
    this.loadUsers();
    this.loadSessions();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error al cargar usuarios:", error);
        this.loading = false;
        this.error = "No se pudieron cargar los usuarios. Verifica que tienes los permisos necesarios."; 
      }
    });
  }

  openUserDialog(user?: User): void {
    this.isEditing = !!user;
    this.selectedUser = user || null;

    this.dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: {
        isEditing: this.isEditing,
        selectedUser: this.selectedUser,
        userService: this.userService
      }
    });

    this.dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (this.isEditing) {
          // Actualizar usuario
          this.userService.updateUser(result.id, result).subscribe({
            next: () => {
              this.loadUsers();
            }
          });
        } else {
          // Crear nuevo usuario
          this.userService.createUser(result).subscribe({
            next: () => {
              this.loadUsers();
            }
          });
        }
      }
    });
  }

  editUser(user: User): void {
    this.openUserDialog(user);
  }

  deleteUser(userId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  getRoleColor(role: string): string {
    return role === 'ADMIN' ? 'warn' : 'primary';
  }

  // Métodos para sesiones y mensajes
  loadSessions(): void {
    this.loadingSessions = true;
    this.chatSessionService.getActiveSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.loadingSessions = false;
      },
      error: (error) => {
        console.error("Error al cargar sesiones:", error);
        this.loadingSessions = false;
      }
    });
  }

  loadMessages(sessionId: string): void {
    if (!this.messages[sessionId]) {
      this.loadingMessages[sessionId] = true;
      this.messageService.getMessagesBySessionId(sessionId).subscribe({
        next: (messages) => {
          this.messages[sessionId] = messages;
          this.loadingMessages[sessionId] = false;
        },
        error: (error) => {
          console.error("Error al cargar mensajes:", error);
          this.loadingMessages[sessionId] = false;
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
