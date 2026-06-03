# Sample Data

This project uses Prisma seed files for sample data.

## Seed files

- backend/prisma/schema.prisma
- backend/prisma/seed.js
- backend/prisma/seed.ts

## How to create sample database


```bash
cd backend
docker compose up -d
npm install
npx prisma generate
npx prisma migrate dev
npm run seed

```

## Detected emails

- alirezanaseri369@gmail.com
- admin@resume-ai.local
- sara.mohammadi@example.com
- amir.hosseini@example.com
- niloofar.karimi@example.com
- reza.ahmadi@example.com
- mahsa.ebrahimi@example.com
- hossein.tavakoli@example.com
- fatemeh.jafari@example.com
- pouya.azizi@example.com

## Detected roles

- user
- USER
- admin
- ADMIN

## Detected password definitions

- password = "11111111"
