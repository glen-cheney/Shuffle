import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
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

function subscribeToGridLanesSupport(): () => void {
  return () => {};
}

function getServerGridLanesSupport(): boolean {
  return false;
}

export const HomepageDemo: React.FC = () => {
  const shuffleRef = useRef<Shuffle | null>(null);
  const shuffleGridLanesRef = useRef<GridLanes | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortValue, setSortValue] = useState('dom');
  const [modePreference, setModePreference] = useState<'shuffle' | 'grid-lanes' | null>(null);
  const supportsGridLanes = useSyncExternalStore(
    subscribeToGridLanesSupport,
    supportsGridLanesDisplay,
    getServerGridLanesSupport,
  );
  const mode = modePreference ?? (supportsGridLanes ? 'grid-lanes' : 'shuffle');

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

  useEffect(() => {
    if (mode === 'shuffle') {
      shuffleRef.current = new Shuffle('#grid', {
        itemSelector: `.${classicGridStyles.pictureItem}`,
        sizer: `.${classicGridStyles.sizer}`,
        delimiter: ' ',
      });
    } else {
      shuffleGridLanesRef.current = new GridLanes('#grid', {
        itemSelector: 'figure',
      });
    }
    return () => {
      shuffleRef.current?.destroy();
      shuffleRef.current = null;
      shuffleGridLanesRef.current?.destroy();
      shuffleGridLanesRef.current = null;
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
          setModePreference(newMode);
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
                  shuffleRef.current?.destroy();
                  shuffleRef.current = null;
                  shuffleGridLanesRef.current?.destroy();
                  shuffleGridLanesRef.current = null;
                }}
              >
                Destroy Shuffle(s)
              </button>
              <button
                type="button"
                className={styles.btn}
                onClick={() => {
                  if (!shuffleRef.current) {
                    shuffleRef.current = new Shuffle('#grid', {
                      itemSelector: `.${classicGridStyles.pictureItem}`,
                      sizer: `.${classicGridStyles.sizer}`,
                      delimiter: ' ',
                    });
                  }
                }}
              >
                Init Shuffle
              </button>
              <button
                type="button"
                className={styles.btn}
                onClick={() => {
                  if (!shuffleGridLanesRef.current) {
                    shuffleGridLanesRef.current = new GridLanes('#grid', {
                      itemSelector: 'figure',
                    });
                  }
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
