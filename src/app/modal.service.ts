// modal.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: { [key: string]: any } = {};

  open(id: string): void {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      document.body.classList.add('modal-open');
      
      // Add backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
    }
  }

  close(id: string): void {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      
      // Remove backdrop
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        document.body.removeChild(backdrop);
      }
    }
  }
}