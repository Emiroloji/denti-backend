// s@/Utils/antdHelper.tsx
import React from 'react';
import { App } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { NotificationInstance } from 'antd/es/notification/interface';

// App.useApp() returns these types
type ModalHookAPI = ReturnType<typeof App.useApp>['modal'];

interface AntdHelper {
  message: MessageInstance | null;
  notification: NotificationInstance | null;
  modal: ModalHookAPI | null;
}

export const antdHelper: AntdHelper = {
  message: null,
  notification: null,
  modal: null,
};

// This is a bridge component to get the context from Antd App
export const AntdStaticHelper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { message, notification, modal } = App.useApp();
  
  antdHelper.message = message;
  antdHelper.notification = notification;
  antdHelper.modal = modal;

  return <>{children}</>;
};
