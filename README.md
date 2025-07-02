# Codality - Elite Software Engineering

A modern, interactive website for Codality, showcasing our AI-powered development services and team expertise.

## Features

- **Interactive 3D Logo**: Custom Three.js animated logo with mouse interaction
- **Responsive Design**: Modern, mobile-friendly layout
- **AI Ethos Section**: Detailed explanation of our AI integration approach
- **Team Profiles**: Showcase of our senior engineering team
- **Industry Solutions**: Comprehensive overview of industries we serve
- **Contact Form**: Interactive contact form for potential clients

## Technologies Used

- HTML5
- CSS3 (with advanced animations and glassmorphism effects)
- JavaScript (ES6+)
- Three.js for 3D graphics
- Google Fonts (Aldrich)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/codality-website.git
   ```

2. Open `index.html` in your web browser

3. For development, you can use any local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

## Project Structure

```
website/
├── index.html          # Main website file
├── assets/             # Images and media files
│   ├── jessie.jpg
│   ├── amit.jpg
│   ├── ryan.jpg
│   └── logo files...
├── README.md           # This file
└── .gitignore          # Git ignore rules
```

## GitHub Pages

This site is hosted on GitHub Pages and can be accessed at:
`https://yourusername.github.io/codality-website`

## Customization

- **Colors**: Update the CSS custom properties in the `<style>` section
- **Content**: Modify the HTML content directly in `index.html`
- **3D Logo**: Customize the Three.js animation in the `<script>` section
- **Images**: Replace images in the `assets/` folder

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

© 2025 Codality. All rights reserved.

## 🚀 Automatic Deployment Setup

This repository is configured for automatic deployment to Firebase Hosting via GitHub Actions.

### Prerequisites

1. **Firebase CLI** installed locally (for initial setup)
2. **GitHub repository** with your code
3. **Firebase project** already configured (codality.tech)

### Setup Steps

#### 1. Generate Firebase Token

First, you need to generate a Firebase CI token:

```bash
# Install Firebase CLI globally if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Generate a CI token
firebase login:ci
```

This will open a browser window for authentication and then provide you with a token.

#### 2. Add Firebase Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `FIREBASE_TOKEN`
5. Value: Paste the token from step 1
6. Click **Add secret**

#### 3. Verify Firebase Configuration

Ensure your `firebase.json` is properly configured (already done):

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### 4. Push to GitHub

Once you've set up the secret, any push to the `main` or `master` branch will trigger an automatic deployment:

```bash
git add .
git commit -m "Update website"
git push origin main
```

### How It Works

- **Trigger**: Pushes to `main` or `master` branch
- **Process**: 
  1. Checks out your code
  2. Sets up Node.js environment
  3. Installs Firebase CLI
  4. Deploys to Firebase using your token
- **Result**: Your changes are live at codality.tech

### Manual Deployment

If you need to deploy manually:

```bash
# Install dependencies
npm install

# Deploy to production
npm run deploy

# Deploy to preview channel
npm run deploy:preview
```

### Local Development

```bash
# Install dependencies
npm install

# Start local server
npm start
```

### Troubleshooting

1. **Token Issues**: If deployment fails, regenerate your Firebase token and update the GitHub secret
2. **Project Issues**: Ensure your Firebase project ID is correct in the workflow file
3. **Permission Issues**: Make sure your Firebase account has proper permissions for the project

### Security Notes

- The `FIREBASE_TOKEN` is stored as a GitHub secret and is encrypted
- Never commit the token directly to your repository
- The token has limited permissions for deployment only

---

**Need help?** Check the [GitHub Actions logs](https://github.com/your-username/your-repo/actions) for detailed error messages. 