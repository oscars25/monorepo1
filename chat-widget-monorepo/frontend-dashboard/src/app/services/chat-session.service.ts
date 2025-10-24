import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomCookieService } from './cookie.service';

export interface ChatSession {
  id: string;
  websiteUrl: string;
  visitorName: string;
  visitorEmail: string;
  status: string;
  assignedAgent?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  sessionId?: string;
  websiteUrl: string;
  visitorName: string;
  visitorEmail: string;
}

export interface AssignAgentRequest {
  agent: any;
}

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

@Injectable({
  providedIn: 'root'
})
export class ChatSessionService {
  private apiUrl = 'http://localhost:8080/api/sessions';

  constructor(private http: HttpClient, private cookieService: CustomCookieService) {}

  private getHeaders(): HttpHeaders {
    const token = this.cookieService.get('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createSession(request: CreateSessionRequest): Observable<ChatSession> {
    return this.http.post<ChatSession>(`${this.apiUrl}`, request, {
      headers: this.getHeaders()
    });
  }

  getSession(sessionId: string): Observable<ChatSession> {
    return this.http.get<ChatSession>(`${this.apiUrl}/${sessionId}`, {
      headers: this.getHeaders()
    });
  }

  getActiveSessions(): Observable<ChatSession[]> {
    return this.http.get<ChatSession[]>(`${this.apiUrl}`, {
      headers: this.getHeaders()
    });
  }

  searchSessions(keyword: string): Observable<ChatSession[]> {
    return this.http.get<ChatSession[]>(`${this.apiUrl}/search?keyword=${keyword}`, {
      headers: this.getHeaders()
    });
  }

  assignAgentToSession(sessionId: string, request: AssignAgentRequest): Observable<ChatSession> {
    return this.http.post<ChatSession>(`${this.apiUrl}/${sessionId}/assign`, request, {
      headers: this.getHeaders()
    });
  }

  closeSession(sessionId: string): Observable<ChatSession> {
    return this.http.post<ChatSession>(`${this.apiUrl}/${sessionId}/close`, {}, {
      headers: this.getHeaders()
    });
  }

  getMessagesBySessionId(sessionId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/${sessionId}/messages`, {
      headers: this.getHeaders()
    });
  }
}
