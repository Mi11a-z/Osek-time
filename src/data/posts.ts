// Демонстрационные данные: лента и страница поста используют один список.
export type Post = {
  id: number;
  named: boolean;
  author: string;
  avatar?: string;
  city: string;
  minutes: number;
  text: string;
  question?: string;
  image?: string;
  imageAlt?: string;
  likes: number;
  comments: string[];
};

export const posts: Post[] = [
  {
    id: 1,
    named: false,
    author: "Аноним",
    city: "Алматы",
    minutes: 12,
    text: "Кажется, весь город нашёл одну и ту же кофейню.",
    question: "Где теперь пить кофе без очереди?",
    likes: 128,
    comments: ["Да, там очереди по 30 минут!", "Попробуйте кофейню на Достык"],
  },
  {
    id: 2,
    named: true,
    author: "Айдана",
    avatar: "/images/aidana-avatar.svg",
    city: "Алматы",
    minutes: 28,
    text: "Вечерний Алматы — отдельный вид любви. Делитесь любимыми маршрутами для прогулок.",
    image: "/images/almaty-evening.png",
    imageAlt: "Вечерний Алматы на фоне заснеженных гор в розовом свете заката",
    likes: 86,
    comments: [],
  },
  {
    id: 3,
    named: false,
    author: "Аноним",
    city: "Астана",
    minutes: 45,
    text: "Какой район вы бы выбрали для жизни и почему?",
    likes: 54,
    comments: [],
  },

   {
    id: 4,
    named: true,
    author: "Камилла",
    city: "Астана",
    minutes: 1,
    text: "посоветуйте где поесть студенту в астане ",
    likes: 0,
    comments: ["Frito", "Durum"],
  },
];
