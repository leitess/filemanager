import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'File Manager',
  tagline: 'Gerenciador de arquivos e seus metadados',
  favicon: 'img/folder.ico',
  url: 'https://leitess.github.io',
  baseUrl: '/filemanager',
  organizationName: 'leitess',
  projectName: 'filemanager',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/happy-folder.jpeg',
    navbar: {
      title: 'File Manager',
      logo: {
        alt: 'A Happy Folder',
        src: 'img/folder.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentação',
        },
        {
          href: 'https://github.com/leitess/filemanager',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentação',
          items: [
            {
              label: 'Documentação',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Redes',
          items: [
            {
              label: 'Linkedin',
              href: 'https://www.linkedin.com/in/leitess/',
            },
            {
              label: 'Github',
              href: 'https://github.com/leitess',
            }
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} File Manager, Inc. Documentação desenvolvida com Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
