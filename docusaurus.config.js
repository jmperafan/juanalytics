// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Juanalytcs',
  tagline: 'Freelance Analytics Work',
  url: 'https://juanalytics.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'Juanalytics', // Usually your GitHub org/user name.
  projectName: 'Juanalytics Website', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Juanaytics',
        logo: {
          alt: 'Juanalytics',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'about',
            position: 'left',
            label: 'About'
          },
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Courses',
          },
          {
            href: 'https://youtube.com/juanalytics',
            label: 'YouTube',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Quick Links',
            items: [
              {
                label: 'Courses',
                to: '/docs/courses',
              },
              {
                label: 'Blog',
                to: '/blog',
              },
            ],
          },
          {
            title: 'Social',
            items: [
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/jmperafan/'
              },              
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/juanalytics'
              },              
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },              
              {
                label: 'Tableau Public',
                href: 'https://public.tableau.com/app/profile/jmperafan'
              }
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Juanalytics B.V. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
