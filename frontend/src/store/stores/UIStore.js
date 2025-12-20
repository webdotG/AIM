import { makeAutoObservable } from 'mobx';

export class UIStore {
  modals = {
    createEntry: false,
    editEntry: false,
    createRelation: false,
    settings: false,
    confirmDelete: false,
    entryDetail: false
  };

  sidebar = {
    isOpen: false,
    width: 250 // px
  };

  notifications = [];


  isLoading = false;
  loadingText = 'Загрузка...';

  error = null;
  errorModalOpen = false;

  constructor() {
    makeAutoObservable(this);
  }

  get activeModals() {
    return Object.keys(this.modals).filter(key => this.modals[key]);
  }

  get hasActiveModal() {
    return this.activeModals.length > 0;
  }

  get unreadNotifications() {
    return this.notifications.filter(n => !n.read);
  }

  openModal(modalName) {
    if (this.modals[modalName] !== undefined) {
      this.modals[modalName] = true;
    }
  }

  closeModal(modalName) {
    if (this.modals[modalName] !== undefined) {
      this.modals[modalName] = false;
    }
  }

  closeAllModals() {
    Object.keys(this.modals).forEach(key => {
      this.modals[key] = false;
    });
  }

  toggleSidebar() {
    this.sidebar.isOpen = !this.sidebar.isOpen;
  }

  openSidebar() {
    this.sidebar.isOpen = true;
  }

  closeSidebar() {
    this.sidebar.isOpen = false;
  }

  addNotification(notification) {
    this.notifications.unshift({
      id: Date.now(),
      ...notification,
      timestamp: new Date(),
      read: false
    });

    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
  }

  markNotificationAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  markAllNotificationsAsRead() {
    this.notifications.forEach(n => n.read = true);
  }

  removeNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  clearNotifications() {
    this.notifications = [];
  }

  startLoading(text = 'Загрузка...') {
    this.isLoading = true;
    this.loadingText = text;
  }

  stopLoading() {
    this.isLoading = false;
    this.loadingText = 'Загрузка...';
  }

  setError(error) {
    this.error = error;
    this.errorModalOpen = true;
    
    this.addNotification({
      type: 'error',
      title: 'Ошибка',
      message: error.message || 'Произошла неизвестная ошибка',
      duration: 5000
    });
  }

  clearError() {
    this.error = null;
    this.errorModalOpen = false;
  }

  showSuccessMessage(message, title = 'Успешно') {
    this.addNotification({
      type: 'success',
      title,
      message,
      duration: 3000
    });
  }

  showErrorMessage(message, title = 'Ошибка') {
    this.addNotification({
      type: 'error',
      title,
      message,
      duration: 5000
    });
  }

  showInfoMessage(message, title = 'Информация') {
    this.addNotification({
      type: 'info',
      title,
      message,
      duration: 4000
    });
  }

  showWarningMessage(message, title = 'Предупреждение') {
    this.addNotification({
      type: 'warning',
      title,
      message,
      duration: 4000
    });
  }

  get modalConfig() {
    return {
      overlayStyle: {
        backgroundColor: 'var(--color-shadow)',
        backdropFilter: 'blur(4px)'
      },
      contentStyle: {
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '600px',
        margin: 'auto'
      }
    };
  }
}


