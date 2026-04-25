import React from 'react';
import cx from 'clsx';

import type { DemoItem } from '../../components/homepage-demo-constants';
import styles from './picture-item-content.module.css';

interface PictureItemContentProps {
  item: DemoItem;
}

export const PictureItemContent: React.FC<PictureItemContentProps> = ({ item }) => (
  <div className={cx(styles.pictureItemInner, item.display.isOverlay && styles.pictureItemOverlay)}>
    {item.display.lockAspectRatio ? (
      <div className="aspect">
        <img className={styles.pictureItemImage} src={item.image} srcSet={item.imageSrcSet} alt={item.alt} />
      </div>
    ) : (
      <img className={styles.pictureItemImage} src={item.image} srcSet={item.imageSrcSet} alt={item.alt} />
    )}

    <div className={styles.pictureItemDetails}>
      <figcaption className={styles.pictureItemTitle} data-title-element>
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </figcaption>
      <p className={styles.pictureItemTags}>{item.tags.join(', ')}</p>
    </div>

    {item.description && <p className={styles.pictureItemDescription}>{item.description}</p>}
  </div>
);
