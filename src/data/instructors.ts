export type Instructor = {
  slug: string;
  name: string;
  role: string;
  bio?: string;
  photo?: string;
};

export const instructors: Instructor[] = [];
