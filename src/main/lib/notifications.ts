const { store: NotificationStore } = require('react-notifications-component');

const defaultParams = {
  type: 'info',
  insert: 'bottom',
  container: 'bottom-right',
  dismiss: {
    duration: 2000,
  },
  animationIn: ['animated', 'easeIn'],
  slidingExit: {
    duration: 200,
    timingFunction: 'ease-out',
    delay: 0
  }
};

export function loading(): string {
  return NotificationStore.addNotification({
    ...defaultParams,
    message: 'Loading ...',
    dismiss: {
      duration: 10000,
    },
  });
}

export function info(s: string): void {
  NotificationStore.addNotification({
    ...defaultParams,
    message: s,
  });
}

export function error(s: string): void {
  NotificationStore.addNotification({
    ...defaultParams,
    message: s,
    type: 'danger',
    dismiss: {
      duration: 5000,
    }
  });
}

export function remove(id: string): void {
  NotificationStore.removeNotification(id);
}
