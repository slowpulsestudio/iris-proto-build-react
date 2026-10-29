import type { Ref } from 'react';
import { cx } from '../../lib/cx.js';
import { Button } from '../Button/Button.js';
import { Icon } from '../Icon/Icon.js';
import { Menu, type MenuEntry } from '../Menu/Menu.js';
import { Tooltip } from '../Tooltip/Tooltip.js';
import styles from './ListToolbarActions.module.css';

export interface ListToolbarActionsProps {
  filterMenuItems: MenuEntry[];
  filterMenuOpen: boolean;
  onFilterOpenChange: (open: boolean) => void;
  createMenuItems: MenuEntry[];
  /** Show an accent dot on the Filter button when filters are active. */
  filterActive?: boolean;
}

/**
 * ListToolbarActions — the Filter + Create menu pair rendered in the
 * ContentHeader toolbar of the directory list pages (Users, Tree).
 */
export function ListToolbarActions({
  filterMenuItems,
  filterMenuOpen,
  onFilterOpenChange,
  createMenuItems,
  filterActive = false,
}: ListToolbarActionsProps) {
  return (
    <>
      <span className={styles.toolbarSeparator} aria-hidden="true" />
      <Menu
        ariaLabel="Filter by"
        align="end"
        items={filterMenuItems}
        open={filterMenuOpen}
        onOpenChange={onFilterOpenChange}
        trigger={({ ref, onClick, expanded }) => (
          <Tooltip label="Add filter" shortcut={['⌘', '⇧', 'F']}>
            <Button
              ref={ref as Ref<HTMLButtonElement>}
              variant="secondary"
              aria-haspopup="menu"
              aria-expanded={expanded}
              onClick={onClick}
            >
              <span className={styles.filterContent}>
                <span className={cx(styles.filterLead, filterActive && styles.filterActive)}>
                  <Icon name="FunnelSimple" size="20px" />
                  {filterActive && <span className={styles.filterDot} aria-hidden="true" />}
                </span>
                Filter
              </span>
            </Button>
          </Tooltip>
        )}
      />
      <Menu
        ariaLabel="Create options"
        align="end"
        items={createMenuItems}
        trigger={({ ref, onClick, expanded }) => (
          <Button
            ref={ref as Ref<HTMLButtonElement>}
            variant="primary"
            iconLead="Plus"
            iconTrail="CaretDown"
            className={styles.addBtn}
            aria-haspopup="menu"
            aria-expanded={expanded}
            onClick={onClick}
          >
            Create
          </Button>
        )}
      />
    </>
  );
}
