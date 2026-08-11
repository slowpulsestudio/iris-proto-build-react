import { type ReactNode } from 'react';
import { cx } from '../../lib/cx.js';
import { ResourceIcon } from '../ResourceIcon/ResourceIcon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Tooltip } from '../Tooltip/Tooltip.js';
import styles from './ContentHeader.module.css';

export interface ContentHeaderProps {
  /** Layout treatment. `list` for listing pages, `detail` for object detail pages. */
  variant?: 'list' | 'detail';
  /** Leading ResourceIcon glyph. */
  icon: string;
  /** Accessible label for the leading icon. Omit to treat the icon as decorative. */
  iconLabel?: string;
  /** Main heading. Accepts composed nodes (e.g. a title plus a dimmed alias). */
  title: ReactNode;
  /** `detail` only — secondary line beneath the title. */
  subtitle?: ReactNode;
  /** `detail` only — renders a leading back button that calls this handler. */
  onBack?: () => void;
  /** aria-label + tooltip for the back button. */
  backLabel?: string;
  /**
   * Right-aligned control cluster. In `list` it holds the page overflow menu;
   * in `detail` it holds the prev/next pager and actions menu.
   */
  actions?: ReactNode;
  /** `list` only — search field, rendered in the toolbar row (grows to fill). */
  search?: ReactNode;
  /** `list` only — action cluster shown to the right of the search field. */
  toolbarActions?: ReactNode;
  /** `list` only — filter bar rendered beneath the toolbar. */
  filters?: ReactNode;
  /** `detail` only — tab strip rendered at the bottom of the header. */
  tabs?: ReactNode;
  className?: string;
}

/**
 * ContentHeader — the shared page/detail header used across directory views.
 *
 *   // Listing page
 *   <ContentHeader icon="Users" title="Users" actions={<Menu … />}
 *     search={<TextInput … />} toolbarActions={<>…</>} filters={<Filters … />} />
 *
 *   // Detail page
 *   <ContentHeader variant="detail" icon={meta.icon} iconLabel={`${name} icon`}
 *     title={name} subtitle={subtitle} onBack={() => navigate('#/users')}
 *     backLabel="Back to Users" actions={<>…pager…</>} tabs={<Tabs … />} />
 */
export function ContentHeader({
  variant = 'list',
  icon,
  iconLabel,
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  actions,
  search,
  toolbarActions,
  filters,
  tabs,
  className,
}: ContentHeaderProps) {
  if (variant === 'detail') {
    return (
      <header className={cx(styles.header, className)}>
        <div className={styles.identityRow}>
          {onBack && (
            <Tooltip label={backLabel}>
              <IconButton icon="ArrowLeft" ariaLabel={backLabel} onClick={onBack} />
            </Tooltip>
          )}
          <ResourceIcon icon={icon} size="l" iconSize="20px" ariaLabel={iconLabel} />
          <div className={styles.identityText}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle != null && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={styles.pager}>{actions}</div>}
        </div>
        {tabs && <div className={styles.tabs}>{tabs}</div>}
      </header>
    );
  }

  return (
    <header className={cx(styles.header, className)}>
      <div className={styles.titleRow}>
        <ResourceIcon icon={icon} size="l" iconSize="20px" ariaLabel={iconLabel} />
        <h1 className={styles.title}>{title}</h1>
        {actions && <div className={styles.titleActions}>{actions}</div>}
      </div>

      {(search || toolbarActions) && (
        <div className={styles.toolbar}>
          {search && <div className={styles.search}>{search}</div>}
          {toolbarActions && <div className={styles.actions}>{toolbarActions}</div>}
        </div>
      )}

      {filters && <div className={styles.filtersBar}>{filters}</div>}
    </header>
  );
}
