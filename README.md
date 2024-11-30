# VibeChat

Welcome to VibeChat, a real-time messaging platform designed to connect users in a dynamic and engaging way. Built with the MERN stack and utilizing Firebase for backend services, VibeChat offers a seamless chatting experience.

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js, Express.js
- **Storage & Authentication:** Firebase

## Features

### User Search and Friend Requests
- **Search for Friends:** Easily find users through a robust search feature.
- **Send Friend Requests:** Connect with others by sending friend requests.
- **Requests Tab:** Messages from non-friends go to a separate "Requests" tab, keeping your main chat list organized.

### Chat Functionality
- **Free Messaging:** Enjoy chatting with friends at no cost.
- **Accept/Decline Requests:** Users can accept or decline friend requests. If declined, communication is not possible.

### Upcoming Features
- **Voice Notes:** Users will be able to send voice messages, adding a personal touch to conversations.
- **Video Calls:** A future feature aiming to facilitate real-time video communication between users.

### Unique Features
- **Reactions:** Users can react to messages, adding an expressive layer to conversations without needing to type.
- **Smart Replies:** This feature will suggest quick responses based on the context and sentiment of the conversation, enhancing the chatting experience.

## Getting Started

### Prerequisites

Make sure you have the following installed:
- Node.js
- MongoDB
- Firebase

Additionally, each user needs to:
- **Create their own Firebase account** and set up a unique project for Firebase storage and authentication.
- Obtain Firebase credentials (API Key, Auth Domain, Project ID, etc.) and configure them for successful integration.

### Installation

VibeChat has two main directories: one for the frontend and one for the backend. To set it up locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/B-uchi/vibe-chat-react.git
   ```
2. Navigate to the backend directory:
   ```bash
   cd vibe-chat-react/backend
   ```
3. Install the backend dependencies:
   ```bash
   npm install
   ```
4. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
5. Install the frontend dependencies:
   ```bash
   npm run dev
   ```
### Running the Application
1. **Start the backend** by navigating to the backend directory and running:
   ```bash
   npm run dev
   ```
2. **Start the frontend** by navigating to the frontend directory and running:
    ```bash
   npm run dev
   ```

### Contributing
We welcome contributions! If you'd like to contribute to VibeChat, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.


