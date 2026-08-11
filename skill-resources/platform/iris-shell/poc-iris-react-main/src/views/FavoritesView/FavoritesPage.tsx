import { type MouseEvent } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { navigate } from '../../lib/router.js';
import { useFavorites, type FavoriteEntry } from '../../lib/useFavorites.js';
import { Link } from '../../components/Link/Link.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { ContentHeader } from '../../components/ContentHeader/ContentHeader.js';
import { DataTable, type DataTableColumn } from '../../components/DataTable/DataTable.js';
import styles from './FavoritesPage.module.css';

const COLUMNS: DataTableColumn<FavoriteEntry>[] = [
  {
    key: 'name',
    header: 'Name',
    icon: 'IdentificationCard',
    minWidth: '200px',
    grow: 1,
    cell: (f) => (
      <Link
        href={f.href}
        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          navigate(f.href);
        }}
      >
        {f.name}
      </Link>
    ),
  },
  { key: 'type', header: 'Type', icon: 'Tag', width: '180px', cell: (f) => f.type },
  {
    key: 'description',
    header: 'Description',
    icon: 'ArticleNyTimes',
    minWidth: '240px',
    grow: 2,
    cell: (f) => <span title={f.description}>{f.description ?? '—'}</span>,
  },
];

/**
 * FavoritesPage — a curated shortcut list of favorited objects. Rows deep-link
 * to each object's canonical detail.
 */
export function FavoritesPage() {
  const { entries, remove } = useFavorites();

  return (
    <AppShell breadcrumb={[{ label: 'Directory Management' }, { label: 'Favourites' }]}>
      <ContentHeader icon="Heart" title="Favourites" />

      <div className={styles.tableWrap}>
        <DataTable
          rows={entries}
          columns={COLUMNS}
          ariaLabel="Favourites"
          rowLabel={(f) => f.name}
          rowActions={(f) => (
            <Tooltip label="Remove from favourites">
              <IconButton
                icon="Trash"
                ariaLabel={`Remove ${f.name} from favourites`}
                size="s"
                onClick={() => remove(f.id)}
              />
            </Tooltip>
          )}
          emptyState={{
            title: 'No favourites yet',
            description: 'Star an object to see it here.',
          }}
        />
      </div>
    </AppShell>
  );
}
