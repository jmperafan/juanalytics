# Juanalytics Portfolio

Personal portfolio website for Juan Manuel Perafan, showcasing blogs, videos, and podcasts about analytics engineering, dbt, and data communities.

## Features

- 📝 Blog posts in Markdown
- 🎥 Video showcase with YouTube embedding
- 🎙️ Podcast episodes with audio player support
- 🎨 Clean, responsive design
- 🚀 Fast, static site built with Astro

## Getting Started with Docker

### Prerequisites

- Docker and Docker Compose installed on your machine

### Running the Development Server

1. Build and start the container:
```bash
docker-compose up
```

2. Open your browser and visit: `http://localhost:4321`

3. To stop the server, press `Ctrl+C` or run:
```bash
docker-compose down
```

### Rebuilding After Changes

If you modify `package.json` or `Dockerfile`:
```bash
docker-compose down
docker-compose build
docker-compose up
```

## Adding Content

### Blog Posts

Create a new Markdown file in `src/content/blog/`:

```markdown
---
title: 'Your Blog Post Title'
description: 'A brief description'
pubDate: 2024-01-15
tags: ['dbt', 'analytics']
heroImage: '/path/to/image.jpg' # optional
---

Your content here...
```

### Videos

Create a new Markdown file in `src/content/videos/`:

```markdown
---
title: 'Your Video Title'
description: 'A brief description'
pubDate: 2024-01-15
videoUrl: 'https://www.youtube.com/watch?v=...'
platform: 'youtube'
tags: ['tutorial']
thumbnail: '/path/to/thumbnail.jpg' # optional
---

Video description and notes...
```

### Podcasts

Create a new Markdown file in `src/content/podcasts/`:

```markdown
---
title: 'Episode Title'
description: 'Episode description'
pubDate: 2024-01-15
episode: 1
duration: '45:30'
audioUrl: 'https://example.com/audio.mp3' # optional
tags: ['data', 'community']
---

Episode notes and show links...
```

## Customization

### Update Your Info

1. Edit personal information in `src/pages/about.astro`
2. Update social links in `src/layouts/BaseLayout.astro`
3. Modify hero section in `src/pages/index.astro`

### Styling

- Global styles: `src/styles/global.css`
- Colors and theme variables are defined in CSS custom properties at the top of `global.css`

### GitHub Pages Configuration

Update `astro.config.mjs`:
- `site`: Your GitHub Pages URL
- `base`: Your repository name (or remove if using a custom domain)

## Deploying to GitHub Pages

1. Create a new GitHub repository
2. Push your code to the repository
3. Go to repository Settings → Pages
4. Set Source to "GitHub Actions"
5. The site will automatically deploy on every push to the `main` branch

Your site will be available at: `https://[username].github.io/[repo-name]/`

## Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── content/        # Content collections
│   │   ├── blog/       # Blog posts
│   │   ├── videos/     # Video content
│   │   └── podcasts/   # Podcast episodes
│   ├── layouts/        # Page layouts
│   ├── pages/          # Site pages and routes
│   ├── styles/         # Global styles
│   └── content/config.ts  # Content collections schema
├── astro.config.mjs    # Astro configuration
├── Dockerfile          # Docker configuration
└── docker-compose.yml  # Docker Compose setup
```

## Built With

- [Astro](https://astro.build) - Static site framework
- [MDX](https://mdxjs.com/) - Markdown with components
- Docker - Containerization

## License

This project is open source and available under the MIT License.
