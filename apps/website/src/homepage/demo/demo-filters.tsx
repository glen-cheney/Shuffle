import React from 'react';
import cx from 'clsx';

import styles from './demo-filters.module.css';

interface DemoFiltersProps {
  activeFilter: string | null;
  mode: 'shuffle' | 'grid-lanes';
  onFilterChange: (filter: string | null) => void;
  onModeChange: (mode: 'shuffle' | 'grid-lanes') => void;
  onSearchTextChange: (text: string) => void;
  onSortChange: (sort: string) => void;
  searchText: string;
  sortValue: string;
}

export const DemoFilters: React.FC<DemoFiltersProps> = ({
  searchText,
  activeFilter,
  mode,
  sortValue,
  onSearchTextChange,
  onFilterChange,
  onModeChange,
  onSortChange,
}) => (
  <div className="container">
    <div className="row">
      <div className={cx('col', 'col--4-sm')}>
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
              onSearchTextChange(event.target.value);
            }}
          />
        </div>
      </div>
      <div className={cx('col', 'col--8-sm', styles.flexEndAtSmall)}>
        <fieldset className={styles.filtersGroup}>
          <legend className={styles.filterLabel}>Mode</legend>
          <div className={styles.btnGroup}>
            {[
              { value: 'shuffle', label: 'Class JS Layout' },
              { value: 'grid-lanes', label: 'Native Grid Lanes' },
            ].map((option) => (
              <label key={option.value} className={cx(styles.btn, mode === option.value && styles.active)}>
                <input
                  type="radio"
                  name="mode-value"
                  value={option.value}
                  checked={mode === option.value}
                  onChange={(event) => {
                    onModeChange(event.target.value as 'shuffle' | 'grid-lanes');
                  }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
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
                  onFilterChange(activeFilter === group ? null : group);
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
                    onSortChange(event.target.value);
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
);
