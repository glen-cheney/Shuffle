import React from 'react';
import cx from 'clsx';

import { DEMO_ITEMS } from '../../components/homepage-demo-constants';
import { PictureItemContent } from './picture-item-content';
import styles from './grid-lanes-grid.module.css';

export const GridLanesGrid: React.FC = () => (
  <div className="container">
    <div id="grid" className={cx('grid-container', styles['my-grid-lanes'])}>
      {DEMO_ITEMS.map((item) => (
        <figure
          key={item.id}
          className={cx(
            styles['my-grid-lane-item'],
            item.display.heightSpan2 && styles['my-grid-lane-item--height-2'],
            `grid-lane-item--${item.display.colXs}-xs`,
            `grid-lane-item--${item.display.colSm}-sm`,
            `grid-lane-item--${item.display.colMd}-md`,
          )}
          data-groups={item.groups.join(' ')}
          data-date-created={item.dateCreated}
          data-title={item.title}
        >
          <PictureItemContent item={item} />
        </figure>
      ))}
    </div>
  </div>
);
