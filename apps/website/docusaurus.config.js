// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Shuffle.js',
  tagline: 'Categorize, sort, and filter a responsive grid of items',
  url: 'https://vestride.github.io/',
  baseUrl: '/Shuffle/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',
  organizationName: 'Vestride',
  projectName: 'Shuffle',
  trailingSlash: false,

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/Vestride/Shuffle/tree/main/apps/website/docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        googleAnalytics: {
          trackingID: 'UA-39355642-1',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Shuffle.js',
        logo: {
          alt: 'Shuffle.js Logo',
          src: 'img/favicon.svg',
          width: 24,
          height: 24,
        },
        items: [
          {
            type: 'doc',
            docId: 'install',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://www.buymeacoffee.com/glen.cheney',
            label: 'Buy me a coffee',
            position: 'right',
          },
          {
            href: 'https://github.com/Vestride/Shuffle',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Installation',
                to: '/docs/install',
              },
              {
                label: 'FAQs',
                to: '/docs/faqs',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Twitter',
                href: 'https://twitter.com/Vestride',
              },
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/search?q=shuffle+js',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/Vestride/Shuffle',
              },
              {
                label: 'CodePen template',
                href: 'http://codepen.io/pen?template=qrjOpX',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Glen Cheney. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      image: 'img/shuffle-open-graph.png',
    }),
};

module.exports = config;
