import React, { useEffect, useRef, useState } from 'react';
import cx from 'clsx';
import Shuffle from 'shufflejs';
import styles from './homepage-demo.module.css';
import { DEMO_ITEMS } from './homepage-demo-constants';

const DEBUG = false;

type ShuffleInstance = InstanceType<typeof Shuffle>;

export const HomepageDemo: React.FC = () => {
  const shuffleRef = useRef<ShuffleInstance | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortValue, setSortValue] = useState('dom');

  // Helper function to apply filter and search together
  const applyFilter = (search: string, filter: string | null) => {
    if (!shuffleRef.current) {
      return;
    }

    const searchLower = search.toLowerCase();
    shuffleRef.current.filter((element: HTMLElement) => {
      if (filter) {
        const { groups } = element.dataset;
        if (groups) {
          const groupArray = JSON.parse(groups) as string[];
          if (!groupArray.includes(filter)) {
            return false;
          }
        }
      }

      const titleElement = element.querySelector(`.${styles.pictureItemTitle}`);
      if (!titleElement) {
        return true;
      }

      const titleText = titleElement.textContent?.toLowerCase().trim() ?? '';
      return titleText.includes(searchLower);
    });
  };

  // Helper function to apply sorting
  const applySort = (sort: string) => {
    if (!shuffleRef.current) {
      return;
    }

    let sortOptions = {};

    if (sort === 'title') {
      sortOptions = {
        by: (element: HTMLElement) => (element.dataset.title ?? '').toLowerCase(),
      };
    } else if (sort === 'date-created') {
      sortOptions = {
        reverse: true,
        by: (element: HTMLElement) => element.dataset.dateCreated ?? '',
      };
    }

    shuffleRef.current.sort(sortOptions);
  };

  const destroyShuffle = () => {
    if (shuffleRef.current) {
      shuffleRef.current.destroy();
      shuffleRef.current = null;
    }
  };

  const initShuffle = () => {
    shuffleRef.current ??= new Shuffle('#grid', {
      itemSelector: `.${styles.pictureItem}`,
      sizer: `.${styles.sizer}`,
    });
  };

  // Initialize Shuffle on mount
  useEffect(() => {
    initShuffle();

    return destroyShuffle;
  }, []);

  return (
    <section className={styles.homepageDemo}>
      <hr />
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <h2>Demo</h2>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className={cx('col', styles['col--4-sm'])}>
            <div className={styles.filtersGroup}>
              <label htmlFor="filters-search-input" className={styles.filterLabel}>
                Search
              </label>
              <input
                className={styles.textfield}
                type="search"
                id="filters-search-input"
                placeholder="Search items..."
                value={searchText}
                onChange={(event) => {
                  const newSearchText = event.target.value;
                  setSearchText(newSearchText);
                  applyFilter(newSearchText, activeFilter);
                  applySort(sortValue);
                }}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className={cx('col', 'col--12', styles.filtersWrap)}>
            <div className={styles.filtersGroup}>
              <p className={styles.filterLabel}>Filter</p>
              <div className={styles.btnGroup}>
                {['space', 'nature', 'animal', 'city'].map((group) => (
                  <button
                    key={group}
                    type="button"
                    className={cx(styles.btn, styles.btnPrimary, activeFilter === group && styles.active)}
                    onClick={() => {
                      const newFilter = activeFilter === group ? null : group;
                      setActiveFilter(newFilter);
                      applyFilter(searchText, newFilter);
                      applySort(sortValue);
                    }}
                  >
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <fieldset className={styles.filtersGroup}>
              <legend className={styles.filterLabel}>Sort</legend>
              <div className={styles.btnGroup}>
                {[
                  { value: 'dom', label: 'Default' },
                  { value: 'title', label: 'Title' },
                  { value: 'date-created', label: 'Date Created' },
                ].map((option) => (
                  <label key={option.value} className={cx(styles.btn, sortValue === option.value && styles.active)}>
                    <input
                      type="radio"
                      name="sort-value"
                      value={option.value}
                      checked={sortValue === option.value}
                      onChange={(event) => {
                        const newSortValue = event.target.value;
                        setSortValue(newSortValue);
                        applySort(newSortValue);
                      }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div className="container">
        <div id="grid" className={cx('row', styles.myShuffle)}>
          {DEMO_ITEMS.map((item) => (
            <figure
              key={item.id}
              className={cx(
                'col',
                styles[`col--${item.display.colXs}-xs`],
                styles[`col--${item.display.colSm}-sm`],
                styles[`col--${item.display.colMd}-md`],
                styles.pictureItem,
                item.display.isOverlay && styles.pictureItemOverlay,
                item.display.heightSpan2 && styles.pictureItemH2,
              )}
              data-groups={JSON.stringify(item.groups)}
              data-date-created={item.dateCreated}
              data-title={item.title}
            >
              <div className={styles.pictureItemInner}>
                {item.display.lockAspectRatio ? (
                  <div className={styles.aspect}>
                    <img src={item.image} srcSet={item.imageSrcSet} alt={item.alt} />
                  </div>
                ) : (
                  <img src={item.image} srcSet={item.imageSrcSet} alt={item.alt} />
                )}

                <div className={styles.pictureItemDetails}>
                  <figcaption className={styles.pictureItemTitle}>
                    <a href={item.url} target="_blank" rel="noopener">
                      {item.title}
                    </a>
                  </figcaption>
                  <p className={styles.pictureItemTags}>{item.tags.join(', ')}</p>
                </div>

                {item.description && <p className={styles.pictureItemDescription}>{item.description}</p>}
              </div>
            </figure>
          ))}

          <div className={cx('col', styles['col--1-xs'], styles['col--1-sm'], styles.sizer)} />
        </div>
      </div>

      {DEBUG && (
        <div className="container">
          <div className="row">
            <div className="col col--12">
              <button
                type="button"
                className={styles.btn}
                onClick={() => {
                  destroyShuffle();
                }}
              >
                Destroy Shuffle
              </button>
              <button
                type="button"
                className={styles.btn}
                onClick={() => {
                  initShuffle();
                }}
              >
                Init Shuffle
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
