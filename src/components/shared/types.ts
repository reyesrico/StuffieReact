import { ReactNode } from 'react';

export interface TextFieldProps {
  name: string,
  type: string,
  placeholder?: string,
  value?: string,
  onChange?: Function,
  disabled?: boolean,
  ref?: any
}

export interface MenuProps {
  label: Function,
  children: ReactNode
}

export interface MenuState {
  isOpen: boolean
}

export interface DropDownProps {
  onChange: Function,
  values: any
}

export interface DropDownState {
  valueSelected: any
}

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingProps {
  size: LoadingSize,
  message?: string
}

export interface ButtonProps {
  type?: 'submit' | 'reset' | 'submit',
  onClick?: Function,
  text: string,
  disabled?: boolean
}

export enum WarningMessageType {
  ERROR = 'error',
  SUCCESSFUL = 'successful',
  WARNING ='warning'
}

export interface WarningMessageProps {
  message: string,
  type?: WarningMessageType,
  show: boolean
}
