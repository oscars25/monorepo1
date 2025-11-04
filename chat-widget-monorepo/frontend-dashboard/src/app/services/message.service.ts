import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomCookieService } from './cookie.service';
import { ApiConfigService } from './api-config.service';

export interface Message {
  id: number;
  content: string;
  isFromAgent: boolean;
  createdAt: string;
  user: {
    id: number;
    username: string;
    fullName: string;
  };
}

export interface CreateMessageRequest {
  sessionId: string;
  content: string;
  isFromAgent: boolean;
}

export interface UpdateMessageRequest {
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl: string;

  constructor(
    private http: HttpClient, 
    private cookieService: CustomCookieService,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.getFullUrl('/api/messages');
  }

  private getHeaders(): HttpHeaders {
    const token = this.cookieService.get('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createMessage(request: CreateMessageRequest): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}`, request, {
      headers: this.getHeaders()
    });
  }

  getMessagesBySessionId(sessionId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/session/${sessionId}`, {
      headers: this.getHeaders()
    });
  }

  getAgentMessagesBySessionId(sessionId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/session/${sessionId}/agent`, {
      headers: this.getHeaders()
    });
  }

  getVisitorMessagesBySessionId(sessionId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/session/${sessionId}/visitor`, {
      headers: this.getHeaders()
    });
  }

  updateMessage(messageId: number, request: UpdateMessageRequest): Observable<Message> {
    return this.http.put<Message>(`${this.apiUrl}/${messageId}`, request, {
      headers: this.getHeaders()
    });
  }

  deleteMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${messageId}`, {
      headers: this.getHeaders()
    });
  }
}
