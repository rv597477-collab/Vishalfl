import { atom } from 'nanostores';

export interface AuthUser {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
}

/** Populated from the root loader on every page load. null = not logged in. */
export const authUserStore = atom<AuthUser | null>(null);
