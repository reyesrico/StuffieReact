import { ReactNode } from 'react';

export interface TextFieldProps {
  name: string,
  type: string,
  value?: string,
  onChange: Function
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
