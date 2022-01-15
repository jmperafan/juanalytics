// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Juanalytics',
  tagline: 'Analytics Engineer',
  url: 'https://juanalytics.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'Juanalytics',
  projectName: 'Juanalytics Website',

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/jmperafan/juanalytics',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/jmperafan/juanalytics',
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
            label: 'About'
          }, 
          {
            type: 'doc',
            docId: 'courses/courses',
            label: 'Courses'
          },        
          {
            type: 'doc',
            docId: 'certifications',
            label: 'Certifications',
          },
          {
            href: 'https://youtube.com/juanalytics',
            label: 'YouTube',
          },
        ],
      },
      footer: {
        links: [
          {
            title: 'Quick Links',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },              
              {
                label: 'Courses',
                to: '/docs/courses',
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
