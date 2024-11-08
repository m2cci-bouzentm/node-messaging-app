# Node Messaging App

This is a messaging application built with a React frontend and a Node.js backend. The frontend uses TypeScript and Vite for a fast development experience, while the backend uses Prisma for database management and a whole bunch of other technologies !

## Features

- Real-time messaging with socket.io
- User authentication and authorization
- Group and individual conversations
- Sending images
- File uploads
- Message notifications
- Mobile friendly UI
- Tracking unread messages while offline in conversations
- User settings page for managing username, password, email, and profile picture

## Technologies Used

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn
- Material UI

### Backend

- Node.js
- Express
- Prisma with Postgresql
- JWT
- Socket.io
- Express Validator
- Express Async Handler
- Muter middleware
- Cloudinary to store images & files

## Project Structure

```
client/
  .env
  .gitignore
  components.json
  eslint.config.js
  index.html
  package.json
  postcss.config.js
  public/
  src/
    App.tsx
    assets/
    components/
    context.tsx
    helpers.ts
  tailwind.config.js
  tsconfig.app.json
  tsconfig.json
  tsconfig.node.json
  vercel.json
  vite.config.ts
server/
  .env
  .eslintrc.js
  .gitignore
  app.js
  bin/
  controllers/
  eventHandlers/
  package.json
  prisma/
  public/
  routes/
readme.md
```

## Getting Started

### Prerequisites

- Node.js
- Docker (optional, for containerized deployment)
- Postgresql database

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/node-messaging-app.git
   cd node-messaging-app
   ```

2. Install dependencies for both client and server:

   ```sh
   cd client
   npm install
   cd ../server
   npm install
   ```

3. Set up environment variables:

   - Create a `.env` file in both `client` and `server` directories based on the provided `.env.example` files.

4. Start the development servers:

   ```sh
   # In the client directory
   npm run dev

   # In the server directory
   npm start
   ```

## TODOs

- Display the count of unread messages in group chats to help users track messages received while they were offline.


## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.