
export type OptionalExcept<T, Exceptions extends keyof T> = Pick<T, Exceptions> & Partial<Omit<T, Exceptions>>
