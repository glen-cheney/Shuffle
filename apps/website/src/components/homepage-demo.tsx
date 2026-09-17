import React, { useEffect, useRef, useState } from 'react';
import Shuffle from 'shufflejs';
import GridLanes from 'shufflejs/grid-lanes';
import styles from './homepage-demo.module.css';
import { DemoFilters } from '../homepage/demo/demo-filters';
import { ClassicShuffleGrid } from '../homepage/demo/classic-shuffle-grid';
import classicGridStyles from '../homepage/demo/classic-shuffle-grid.module.css';
import { GridLanesGrid } from '../homepage/demo/grid-lanes-grid';

const DEBUG = false;

function getSortOptions(sortValue: string) {
  if (sortValue === 'title') {
    return {
      by: (element: HTMLElement) => (element.dataset.title ?? '').toLowerCase(),
    };
  }

  if (sortValue === 'date-created') {
    return {
      reverse: true,
      by: (element: HTMLElement) => element.dataset.dateCreated ?? '',
    };
  }

  return {};
}

function filterWithSearch(element: HTMLElement, searchText: string, activeFilter: string | null): boolean {
  const searchLower = searchText.toLowerCase();

  if (activeFilter) {
    const { groups } = element.dataset;
    if (groups) {
      const groupArray = groups.split(' ');
      if (!groupArray.includes(activeFilter)) {
        return false;
      }
    }
  }

  const titleElement = element.querySelector('[data-title-element]');
  if (!titleElement) {
    return true;
  }

  const titleText = titleElement.textContent?.toLowerCase().trim() ?? '';
  return titleText.includes(searchLower);
}

function supportsGridLanesDisplay(): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('display', 'grid-lanes');
}

export const HomepageDemo: React.FC = () => {
  const shuffleRef = useRef<Shuffle | null>(null);
  const shuffleGridLanesRef = useRef<GridLanes | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortValue, setSortValue] = useState('dom');
  // 'shuffle' first so server prerender and hydration agree; upgraded on mount below.
  const [mode, setMode] = useState<'shuffle' | 'grid-lanes'>('shuffle');
  const [supportsGridLanes, setSupportsGridLanes] = useState(false);

  // Helper function to apply filter, search, and sort together
  const applyFilter = (search: string, filter: string | null, currentSortValue: string) => {
    if (shuffleRef.current) {
      shuffleRef.current.filter(
        (element: HTMLElement) => filterWithSearch(element, search, filter),
        getSortOptions(currentSortValue),
      );
    }

    if (shuffleGridLanesRef.current) {
      shuffleGridLanesRef.current.filter(
        (element: HTMLElement) => filterWithSearch(element, search, filter),
        getSortOptions(currentSortValue),
      );
    }
  };

  // Helper function to apply sorting
  const applySort = (sort: string) => {
    if (shuffleRef.current) {
      shuffleRef.current.sort(getSortOptions(sort));
    }

    if (shuffleGridLanesRef.current) {
      shuffleGridLanesRef.current.sort(getSortOptions(sort));
    }
  };

  const destroyShuffle = () => {
    if (shuffleRef.current) {
      shuffleRef.current.destroy();
      shuffleRef.current = null;
    }
  };

  const initShuffle = () => {
    shuffleRef.current ??= new Shuffle('#grid', {
      itemSelector: `.${classicGridStyles.pictureItem}`,
      sizer: `.${classicGridStyles.sizer}`,
      delimiter: ' ',
    });
  };

  const destroyGridLanes = () => {
    if (shuffleGridLanesRef.current) {
      shuffleGridLanesRef.current.destroy();
      shuffleGridLanesRef.current = null;
    }
  };

  const initGridLanes = () => {
    shuffleGridLanesRef.current ??= new GridLanes('#grid', {
      itemSelector: 'figure',
    });
  };

  useEffect(() => {
    if (supportsGridLanesDisplay()) {
      setSupportsGridLanes(true);
      setMode('grid-lanes');
    }
  }, []);

  useEffect(() => {
    if (mode === 'shuffle') {
      initShuffle();
    } else {
      initGridLanes();
    }
    return () => {
      destroyShuffle();
      destroyGridLanes();
    };
  }, [mode]);

  return (
    <section className={styles.homepageDemo}>
      <hr />
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <h2>Demo</h2>
            {mode === 'grid-lanes' && (
              <p className={styles.supportNote}>
                {supportsGridLanes ? (
                  'Your browser supports display: grid-lanes.'
                ) : (
                  <span>
                    Your browser does not support <code>grid-lanes</code>. You won't see the masonry layout.
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <DemoFilters
        searchText={searchText}
        activeFilter={activeFilter}
        mode={mode}
        sortValue={sortValue}
        onSearchTextChange={(newSearchText) => {
          setSearchText(newSearchText);
          applyFilter(newSearchText, activeFilter, sortValue);
        }}
        onModeChange={(newMode) => {
          setMode(newMode);
          setSearchText('');
          setActiveFilter(null);
          setSortValue('dom');
        }}
        onFilterChange={(newFilter) => {
          setActiveFilter(newFilter);
          applyFilter(searchText, newFilter, sortValue);
        }}
        onSortChange={(newSortValue) => {
          setSortValue(newSortValue);
          applySort(newSortValue);
        }}
      />

      {mode === 'shuffle' ? <ClassicShuffleGrid key="shuffle" /> : <GridLanesGrid key="grid-lanes" />}

      {DEBUG && (
        <div className="container">
          <div className="row">
            <div className="col col--12" style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                className={styles.btn}
                onClick={() => {
                  destroyShuffle();
                  destroyGridLanes();
                }}
              >
                Destroy Shuffle(s)
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
              <button
                type="button"
                className={styles.btn}
                onClick={() => {
                  initGridLanes();
                }}
              >
                Init Grid Lanes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
