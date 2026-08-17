import type { ReactNode } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { Badge } from '../../components/Badge/Badge.js';
import { Button } from '../../components/Button/Button.js';
import { Icon } from '../../components/Icon/Icon.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Link } from '../../components/Link/Link.js';
import { ProductIcon } from '../../components/ProductIcon/ProductIcon.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { cx } from '../../lib/cx.js';
import {
  GLOBAL_UPTIME,
  SERVICE_CARDS,
  SERVICE_EXTENSIONS,
  type InstanceRow,
  type ServiceCard,
} from './mockServices.js';
import styles from './ServicesPage.module.css';

/**
 * ServicesPage — Service Catalogue for the On-Demand Services vertical.
 * Hosted at `#/services`. Layout mirrors the Figma "Service Catalogue" design
 * (3 service cards over a Service Extensions row) using `--oi-*` design tokens.
 */
export function ServicesPage() {
  return (
    <AppShell
      breadcrumb={[{ label: 'Service Catalogue' }]}
      activeGlobalItem="services"
      showSecondarySidebar={false}
    >
      <div className={styles.page}>
        <PageHeader />

        <ul className={styles.serviceGrid} role="list">
          {SERVICE_CARDS.map((card) => (
            <li key={card.id} className={styles.serviceCell}>
              <ServiceCardView card={card} />
            </li>
          ))}
        </ul>

        <section className={styles.extensions} aria-labelledby="ext-heading">
          <h2 id="ext-heading" className={styles.sectionTitle}>
            Service Extensions
          </h2>
          <ul className={styles.extensionGrid} role="list">
            {SERVICE_EXTENSIONS.map((e) => (
              <li key={e.id}>
                <article className={styles.extensionCard}>
                  <span className={styles.extensionIcon} aria-hidden="true">
                    <Icon name={e.icon} size="20px" />
                  </span>
                  <div className={styles.extensionBody}>
                    <div className={styles.extensionTitleRow}>
                      <h3 className={styles.extensionTitle}>{e.name}</h3>
                      <Tooltip label={`About ${e.name}`}>
                        <span
                          className={styles.infoGlyph}
                          role="img"
                          aria-label="More info"
                          tabIndex={0}
                        >
                          <Icon name="Info" size="14px" />
                        </span>
                      </Tooltip>
                    </div>
                    <span className={styles.extensionStatus}>
                      <Icon
                        name="CheckCircle"
                        size="14px"
                        className={styles.successGlyph}
                      />
                      {e.status}
                    </span>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Page header                                                */
/* ─────────────────────────────────────────────────────────── */

function PageHeader() {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeading}>
        <h1 className={styles.pageTitle}>Welcome back, Sara</h1>
        <p className={styles.pageSubtitle}>
          Global uptime was{' '}
          <span className={styles.uptimeMetric}>{GLOBAL_UPTIME}</span> over the last
          24 hours
        </p>
      </div>
      <div className={styles.pageActions}>
        <IconButton
          icon="ArrowClockwise"
          ariaLabel="Refresh"
          variant="secondary"
          size="default"
        />
        <Button variant="secondary">Status report</Button>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Service card                                               */
/* ─────────────────────────────────────────────────────────── */

interface ServiceCardViewProps {
  card: ServiceCard;
}

function ServiceCardView({ card }: ServiceCardViewProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardHeadProduct}>
          <ProductIcon name={card.productIcon} size={20} />
          <span className={styles.cardHeadTitle}>{card.name}</span>
        </span>
        {card.kind === 'subscribed' && (
          <button
            type="button"
            className={styles.headerCaretBtn}
            aria-label={`Open ${card.name}`}
          >
            <Icon name="CaretRight" size="16px" />
          </button>
        )}
      </div>

      <div className={styles.cardBody}>
        {card.kind === 'subscribed' ? (
          <SubscribedBody card={card} />
        ) : (
          <PromoBody card={card} />
        )}
      </div>
    </article>
  );
}

/* ── Subscribed card body ─────────────────────────────────── */

interface SubscribedBodyProps {
  card: Extract<ServiceCard, { kind: 'subscribed' }>;
}

function SubscribedBody({ card }: SubscribedBodyProps) {
  return (
    <>
      <div className={styles.metaRow}>
        <MetaCell label={card.meta.label}>
          <span className={styles.metaValue}>{card.meta.value}</span>{' '}
          <span className={styles.metaUnit}>{card.meta.unit}</span>
        </MetaCell>
        <MetaCell label="Status">
          <Badge tone={card.status.tone}>{card.status.label}</Badge>
        </MetaCell>
      </div>

      <div className={styles.instances}>
        <p className={styles.instancesLabel}>Instances</p>
        <ul className={styles.instanceList} role="list">
          {card.instances.map((inst) => (
            <li key={inst.id}>
              <InstanceRowView instance={inst} />
            </li>
          ))}
        </ul>
      </div>

      <p className={styles.cardFooter}>
        {card.footer.prompt}{' '}
        <Link href="#/services" onClick={(e) => e.preventDefault()}>
          {card.footer.link}
        </Link>
      </p>
    </>
  );
}

function MetaCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.metaCell}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaContent}>{children}</span>
    </div>
  );
}

function InstanceRowView({ instance }: { instance: InstanceRow }) {
  const isError = instance.tone === 'error';
  return (
    <div className={cx(styles.instanceRow, isError && styles.instanceRowError)}>
      <span className={styles.instanceStatus}>
        <Icon
          name={isError ? 'XCircle' : 'CheckCircle'}
          size="16px"
          className={isError ? styles.errorGlyph : styles.successGlyph}
        />
        <span className={styles.instanceText}>
          <span className={styles.instanceName}>{instance.name}</span>
          <span
            className={isError ? styles.instanceStatusError : styles.instanceStatusSuccess}
          >
            {instance.status}
          </span>
        </span>
      </span>
      <span className={styles.instanceActions}>
        <button
          type="button"
          className={styles.instanceActionBtn}
          aria-label={`${instance.name} preferences`}
        >
          <Icon name="Sliders" size="16px" />
        </button>
        <button
          type="button"
          className={styles.instanceActionBtn}
          aria-label={`${instance.name} performance`}
        >
          <Icon name="Speedometer" size="16px" />
        </button>
      </span>
    </div>
  );
}

/* ── Promo card body ──────────────────────────────────────── */

interface PromoBodyProps {
  card: Extract<ServiceCard, { kind: 'promo' }>;
}

function PromoBody({ card }: PromoBodyProps) {
  return (
    <div className={styles.promoBody}>
      <div className={styles.promoCopy}>
        <p className={styles.promoDescription}>{card.description}</p>
        <Link href={card.learnMoreHref} onClick={(e) => e.preventDefault()}>
          Learn more
        </Link>
      </div>

      <hr className={styles.cardDivider} />

      <ul className={styles.featureList} role="list">
        {card.features.map((feature) => (
          <li key={feature} className={styles.featureRow}>
            <Icon name="Check" size="16px" className={styles.successGlyph} />
            <span className={styles.featureLabel}>{feature}</span>
            <Icon name="Info" size="14px" className={styles.infoGlyph} title={feature} />
          </li>
        ))}
      </ul>

      <Button variant="primary" className={styles.promoCta}>
        {card.cta.label}
      </Button>
    </div>
  );
}
