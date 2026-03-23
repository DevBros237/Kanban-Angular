import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board } from '../models/board.model';
import { environment } from '../../../environments/environment';

export interface CreateBoardDto {
  title: string;
  description?: string;
}

export interface BoardStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

@Injectable({ providedIn: 'root' })
export class BoardsService {
  private readonly http = inject(HttpClient);
  private readonly API  = environment.apiUrl + '/boards';

  getAll(): Observable<Board[]> {
    return this.http.get<Board[]>(this.API);
  }

  getOne(id: string): Observable<Board> {
    return this.http.get<Board>(`${this.API}/${id}`);
  }

  create(dto: CreateBoardDto): Observable<Board> {
    return this.http.post<Board>(this.API, dto);
  }

  update(id: string, dto: Partial<CreateBoardDto>): Observable<Board> {
    return this.http.patch<Board>(`${this.API}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  getStats(id: string): Observable<BoardStats> {
    return this.http.get<BoardStats>(`${this.API}/${id}/stats`);
  }
}
