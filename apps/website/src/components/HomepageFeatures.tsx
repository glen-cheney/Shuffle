import React from 'react';
import clsx from 'clsx';

import styles from './HomepageFeatures.module.css';
import responsiveSvg from '../../static/img/undraw-responsive-design.svg';
import findSvg from '../../static/img/undraw-find-things.svg';
import browsersSvg from '../../static/img/undraw-browsers.svg';
import responsiveSvgDark from '../../static/img/undraw-responsive-design-dark.svg';
import findSvgDark from '../../static/img/undraw-find-things-dark.svg';
import browsersSvgDark from '../../static/img/undraw-browsers-dark.svg';

const features = [
  {
    title: 'Responsive design',
    Svg: responsiveSvg,
    SvgDark: responsiveSvgDark,
    description: (
      <>Shuffle was built to make responsive design easy. Quickly update items in the grid by adding a class.</>
    ),
  },
  {
    title: 'Powerful filters',
    Svg: findSvg,
    SvgDark: findSvgDark,
    description: <>Let your users find what they&rsquo;re looking for with groups and custom filters.</>,
  },
  {
    title: 'Smooth animations',
    Svg: browsersSvg,
    SvgDark: browsersSvgDark,
    description: (
      <>Transitions are all handled by the CSS, which lets the browser optimize them for the user&rsquo;s device.</>
    ),
  },
];

interface FeatureProps {
  Svg: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  SvgDark: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: JSX.Element;
}

const Feature: React.FC<FeatureProps> = ({ Svg, SvgDark, title, description }) => {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <SvgDark className={clsx(styles.featureSvg, styles.featureSvgDark)} />
        <Svg className={clsx(styles.featureSvg, styles.featureSvgLight)} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

const HomepageFeatures: React.FC = () => {
  return (
    <section className={clsx(styles.features, 'padding-vert--lg')}>
      <div className="container">
        <div className="row">
          {features.map((props) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomepageFeatures;
