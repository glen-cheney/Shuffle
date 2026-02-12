import React from 'react';
import cx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '../components/homepage-features';
import { HomepageDemo } from '../components/homepage-demo';

const Logo: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit="1.414"
    clipRule="evenodd"
    viewBox="0 0 32 32"
    width="100"
    height="100"
    className={styles.logo}
  >
    <rect
      className={cx(styles.rect, styles.rect1)}
      id="shuffle-rect-1"
      x="2"
      y="2"
      width="8"
      height="18"
      fill="#2DCB71"
      vectorEffect="non-scaling-stroke"
    />
    <rect
      className={cx(styles.rect, styles.rect2)}
      id="shuffle-rect-2"
      x="12"
      y="2"
      width="8"
      height="8"
      fill="#9B59B5"
      vectorEffect="non-scaling-stroke"
    />
    <rect
      className={cx(styles.rect, styles.rect3)}
      id="shuffle-rect-3"
      x="22"
      y="2"
      width="8"
      height="12"
      fill="#F39B11"
      vectorEffect="non-scaling-stroke"
    />
    <rect
      className={cx(styles.rect, styles.rect4)}
      id="shuffle-rect-4"
      x="2"
      y="22"
      width="8"
      height="8"
      fill="#E74B3B"
      vectorEffect="non-scaling-stroke"
    />
    <rect
      className={cx(styles.rect, styles.rect5)}
      id="shuffle-rect-5"
      x="12"
      y="12"
      width="8"
      height="8"
      fill="#3397DB"
      vectorEffect="non-scaling-stroke"
    />
    <rect
      className={cx(styles.rect, styles.rect6)}
      id="shuffle-rect-6"
      x="22"
      y="16"
      width="8"
      height="4"
      fill="#1ABB9B"
      vectorEffect="non-scaling-stroke"
    />
    <rect
      className={cx(styles.rect, styles.rect7)}
      id="shuffle-rect-7"
      x="12"
      y="22"
      width="18"
      height="8"
      fill="#33495D"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const HomepageHeader: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={cx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Logo />
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/install">
            Get started with Shuffle
          </Link>
        </div>
      </div>
    </header>
  );
};

const Home: React.FC = () => (
  <Layout>
    <HomepageHeader />
    <main>
      <HomepageFeatures />
      <HomepageDemo />
    </main>
  </Layout>
);

export default Home;
