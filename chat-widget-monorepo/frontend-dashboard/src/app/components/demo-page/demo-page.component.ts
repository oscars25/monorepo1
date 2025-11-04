import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatWidgetComponent } from '../widget/chat-widget/chat-widget.component';

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [CommonModule, ChatWidgetComponent],
  template: `
    <div class="demo-container">
      <h1>Hola mundo</h1>
      <p>Página de prueba para el widget de chat</p>
    </div>

    <!-- Widget de chat -->
    <app-chat-widget></app-chat-widget>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .demo-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 60px 20px;
      text-align: center;
    }

    h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 20px;
    }

    p {
      font-size: 1.2rem;
      color: #666;
    }
  `]
})
export class DemoPageComponent {
  constructor() {}
}
