export type ResponseType<T> = {
  loading: boolean;
  result: T | null;
  error: string | null;
};