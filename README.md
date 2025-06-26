WORKS ON LINUX
WINDOWS/MAC CONFIGURATION MIGHT NEED MODIFICATIONS

To run this app you need:
- NVM
- Node.js
- PostgreSQL
After cloning this repo:
- Install typescript:
```
npm install -D typescript @types/node tsx
```
- Install drizzle orm and drizzle-kit:
```
npm i drizzle-orm postgres
npm i -D drizzle-kit
```
- In your home directory create a file called .gatorconfig.json:
```
{
  "db_url": "postgres://example" // url to connect to your local database
}
```
- Run
```
npm run generate
npm run migrate
```

Available commands:
- login
- register
- users
- reset
- agg
- addfeed
- feeds
- follow
- following
- unfollow
- posts
- browse
