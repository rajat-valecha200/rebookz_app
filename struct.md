rebookz-mobile/
│
├── app/
│   ├── _layout.tsx              ← Root Stack
│   │
│   ├── (tabs)/                  ← Bottom Tabs
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── categories.tsx
│   │   ├── my-books.tsx
│   │   └── account.tsx
│   │
│   ├── book/
│   │   └── [id].tsx             ← Book details
│   │
│   ├── add-book.tsx
│   └── favourites.tsx
│
├── assets/
│   ├── logo.png
│   └── placeholder-book.png
│
├── data/                         ← Mock API data
│   ├── books.json
│   ├── categories.json
│   ├── subcategories.json
│   ├── user.json
│   └── likes.json
│
├── components/
│   ├── Header.tsx
│   ├── BookCard.tsx
│   ├── CategoryCard.tsx
│   ├── FloatingButton.tsx
│   └── SearchBar.tsx
│
├── services/
│   ├── bookService.ts
│   ├── categoryService.ts
│   └── userService.ts
│
├── constants/
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
│
├── context/
│   ├── AuthContext.tsx
│   └── LocationContext.tsx
│
├── types/
│   ├── Book.ts
│   ├── Category.ts
│   └── User.ts
│
├── utils/
│   └── distance.ts
│
├── app.json
├── package.json
└── tsconfig.json
