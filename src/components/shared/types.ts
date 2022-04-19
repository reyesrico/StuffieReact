import { ReactNode } from 'react';

export interface TextFieldProps {
  name: string,
  type: string,
  placeholder?: string,
  value?: string,
  onKeyPress?: any,
  onChange?: any,
  disabled?: boolean,
  reference?: any,
  min?: number,
  max?: number,
  children?: any
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
  type?: 'submit' | 'reset',
  onClick?: Function,
  text: string,
  disabled?: boolean,
  children?: any
}

export enum WarningMessageType {
  ERROR = 'error',
  SUCCESSFUL = 'successful',
  WARNING ='warning',
  EMPTY = ''
}

export interface WarningMessageProps {
  message: string,
  type: WarningMessageType,
  show?: boolean
}
