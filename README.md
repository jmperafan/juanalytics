# 🌐 Juanalytics Portfolio

> Personal portfolio and blog for Juan Manuel Perafan - Analytics Engineer, dbt Community Award Recipient, and Data Community Organizer

[![Deploy Status](https://github.com/jmperafan/juanalytics/actions/workflows/deploy.yml/badge.svg)](https://github.com/jmperafan/juanalytics/actions/workflows/deploy.yml)
[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)

**Live Site**: [https://juanalytics.com](https://juanalytics.com)

## 📚 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Content Management](#-content-management)
- [Deployment](#-deployment)
- [Performance](#-performance)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🚀 **Blazing Fast** - Built with Astro for optimal performance
- 📱 **Fully Responsive** - Mobile-first design that works on all devices
- ♿ **Accessible** - WCAG 2.1 compliant with ARIA labels and semantic HTML
- 🎨 **Modern UI** - Clean, professional design with dark theme
- 📝 **Blog** - MDX-powered blog with reading time estimates
- 🎥 **Media Gallery** - Videos, podcasts, and conference talks
- 🔍 **SEO Optimized** - Open Graph, Twitter Cards, and JSON-LD structured data
- 🖼️ **Image Optimization** - WebP images with PNG/JPG fallbacks
- 📄 **RSS Feed** - Subscribe to blog updates with styled RSS

## 🛠️ Tech Stack

- **Framework**: [Astro 4.x](https://astro.build/) - The web framework for content-driven websites
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: Custom CSS with CSS Variables
- **Content**: [MDX](https://mdxjs.com/) for blog posts, YAML for media content
- **Image Optimization**: [Sharp](https://sharp.pixelplumbing.com/)
- **Deployment**: GitHub Pages via GitHub Actions
- **Node Version**: 20.19.5 (see [.nvmrc](.nvmrc))

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.19.5 or higher (use [nvm](https://github.com/nvm-sh/nvm) recommended)
- **npm** 9.x or higher

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/jmperafan/juanalytics.git
   cd juanalytics
   ```

2. **Use the correct Node version** (if using nvm)

   ```bash
   nvm use
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:4321](http://localhost:4321)

## 📁 Project Structure

```text
juanalytics/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD
├── public/                     # Static assets
│   ├── logo.png
│   ├── logo.webp               # Optimized WebP version
│   ├── profile_photo.png
│   ├── profile_photo.webp      # Optimized WebP version
│   ├── rss-styles.xsl          # RSS feed styling
│   ├── robots.txt
│   ├── CNAME
│   └── .nojekyll
├── scripts/
│   ├── optimize-images.js      # Image optimization script
│   └── .env                    # Environment variables (gitignored)
├── src/
│   ├── components/
│   │   ├── ContentFilter.astro # Tag filtering component
│   │   ├── OptimizedImage.astro # WebP image component
│   │   ├── Icon.astro          # Icon component
│   │   └── YouTubeThumbnail.astro
│   ├── content/
│   │   ├── blog/               # MDX blog posts
│   │   │   ├── welcome.md
│   │   │   └── sql-for-data-analytics.md
│   │   └── config.ts           # Content collection schemas
│   ├── layouts/
│   │   └── BaseLayout.astro    # Main layout with SEO, nav, footer
│   ├── pages/
│   │   ├── index.astro         # Homepage
│   │   ├── about.astro
│   │   ├── blog.astro          # Blog listing
│   │   ├── blog/[...slug].astro # Dynamic blog post pages
│   │   ├── talks.astro
│   │   ├── videos.astro
│   │   ├── podcasts.astro
│   │   ├── books.astro
│   │   ├── rss.xml.ts          # RSS feed
│   │   ├── 404.astro           # Custom 404 page
│   │   └── 500.astro           # Custom error page
│   ├── styles/
│   │   ├── global.css          # Global styles and CSS variables
│   │   ├── layout.css          # Layout-specific styles
│   │   └── content.css         # Content page styles
│   ├── utils/
│   │   ├── readingTime.ts      # Calculate blog post reading time
│   │   ├── urlHelper.ts        # URL building utilities
│   │   ├── videoHelper.ts      # Video embed utilities
│   │   ├── contentValidation.ts # Content validation utilities
│   │   ├── envValidation.ts    # Environment validation
│   │   └── yamlParser.ts       # Parse content.yml
│   └── env.d.ts
├── tests/                      # Playwright E2E tests
├── content.yml                 # Media content (videos, podcasts, talks)
├── astro.config.mjs            # Astro configuration
├── tsconfig.json               # TypeScript configuration
├── vitest.config.ts            # Vitest configuration
├── playwright.config.ts        # Playwright configuration
├── package.json
├── .nvmrc                      # Node version specification
└── README.md
```

## 💻 Development

### Available Commands

| Command                | Description                                      |
|------------------------|--------------------------------------------------|
| `npm run dev`          | Start dev server at `localhost:4321`             |
| `npm run build`        | Build for production to `./dist/`                |
| `npm run preview`      | Preview production build locally                 |
| `npm run astro`        | Run Astro CLI commands                           |
| `npm run test`         | Run unit tests with Vitest                       |
| `npm run test:e2e`     | Run E2E tests with Playwright                    |

### Code Quality

- **TypeScript**: Strict mode enabled for type safety
- **Testing**: Unit tests with Vitest, E2E tests with Playwright

### Image Optimization

To optimize images, run:

```bash
node scripts/optimize-images.js
```

This converts PNG/JPG images to WebP format with optimized file sizes.

## 📝 Content Management

### Adding Blog Posts

1. Create a new `.md` or `.mdx` file in `src/content/blog/`
2. Add frontmatter:
   ```yaml
   ---
   title: 'Your Post Title'
   description: 'Brief description for SEO'
   pubDate: 2024-11-16
   heroImage: 'path/to/image.jpg'  # Optional
   tags: ['dbt', 'analytics']      # Optional
   ---
   ```
3. Write your content in Markdown/MDX
4. The post will automatically appear on the blog page

### Adding Media Content

Edit `content.yml` to add videos, podcasts, or talks:

```yaml
videos:
  - title: "Your Video Title"
    description: "Video description"
    url: "https://youtube.com/watch?v=..."
    date: 2024-11-16
    tags: ["dbt", "sql"]

podcasts:
  - title: "Podcast Episode Title"
    description: "Episode description"
    url: "https://podcast-url.com"
    podcast: "Podcast Name"
    date: 2024-11-16
    tags: ["data", "analytics"]
```

## 🚢 Deployment

The site automatically deploys to GitHub Pages when you push to the `main` branch.

### Manual Deployment

```bash
npm run build
# The dist/ folder contains the production build
```

### Environment Variables

For local development with scripts:

```bash
# scripts/.env (gitignored)
YOUTUBE_API_KEY=your_api_key_here
```

## ⚡ Performance

- **Lighthouse Scores**: 90+ across all categories
- **Image Optimization**: WebP format with lazy loading
- **Bundle Size**: Minimal JavaScript footprint
- **CDN**: Deployed on GitHub Pages with global CDN

### Performance Features

- Lazy loading for images
- Preconnect to external resources
- Font optimization with `font-display: swap`
- Minimal JavaScript
- Static site generation (SSG)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📧 Contact

Juan Manuel Perafan

- **Website**: [juanalytics.com](https://juanalytics.com)
- **LinkedIn**: [linkedin.com/in/jmperafan](https://www.linkedin.com/in/jmperafan/)
- **GitHub**: [github.com/jmperafan](https://github.com/jmperafan)
- **YouTube**: [@juanalytics](https://www.youtube.com/@juanalytics)
- **Linktree**: [linktr.ee/juanalytics](https://linktr.ee/juanalytics)

---

**Built with ❤️ using Astro**
