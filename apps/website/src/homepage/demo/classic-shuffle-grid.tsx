import React from 'react';
import cx from 'clsx';

import { DEMO_ITEMS } from '../../components/homepage-demo-constants';
import { PictureItemContent } from './picture-item-content';
import styles from './classic-shuffle-grid.module.css';

export const ClassicShuffleGrid: React.FC = () => (
  <div className="container">
    <div id="grid" className={cx('row', styles.myShuffle)}>
      {DEMO_ITEMS.map((item) => (
        <figure
          key={item.id}
          className={cx(
            'col',
            `col--${item.display.colXs}-xs`,
            `col--${item.display.colSm}-sm`,
            `col--${item.display.colMd}-md`,
            styles.pictureItem,
            item.display.heightSpan2 && styles.pictureItemH2,
          )}
          data-groups={item.groups.join(' ')}
          data-date-created={item.dateCreated}
          data-title={item.title}
        >
          <PictureItemContent item={item} />
        </figure>
      ))}

      <div className={cx('col', 'col--1-xs', 'col--1-sm', styles.sizer)} />
    </div>
  </div>
);
