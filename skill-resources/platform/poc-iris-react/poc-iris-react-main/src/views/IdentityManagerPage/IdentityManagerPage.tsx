import { useMemo, type MouseEvent } from 'react';
import { scaleLinear } from 'd3-scale';
import { line as d3line, area as d3area, curveMonotoneX } from 'd3-shape';
import { AppShell } from '../AppShell/AppShell.js';
import { navigate } from '../../lib/router.js';
import { useAppShell } from '../../lib/appShellContext.js';
import { Icon } from '../../components/Icon/Icon.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { HomeLauncher } from './HomeLauncher.js';
import { HOME_USER_NAME, HOME_CHIPS, HOME_STAT_TILES, HOME_ACTION_CARDS } from './mockIdentityHome.js';
import styles from './IdentityManagerPage.module.css';

/**
 * IdentityManagerPage — Home surface for the Identity Manager vertical
 * (`#/identity`). A start page: greeting, a command-palette launcher, the AI
 * panel's suggestion pills, quick stat tiles, and info/action cards.
 */
export function IdentityManagerPage() {
  const { setAiOpen, setPendingAiPrompt } = useAppShell();

  const openAiWith = (prompt: string) => {
    setPendingAiPrompt(prompt);
    setAiOpen(true);
  };

  const go = (route: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(route);
  };

  return (
    <AppShell breadcrumb={[{ label: 'Account home' }]} activeGlobalItem="home" showSecondarySidebar={false}>
      <div className={styles.page}>
        <section className={styles.hero}>
          <h1 className={styles.greeting}>
            Welcome, {HOME_USER_NAME}! Ask anything or tell us what you need.
          </h1>

          <HomeLauncher />

          <div className={styles.chips}>
            {HOME_CHIPS.map((c) => (
              <button
                key={c.label}
                type="button"
                className={styles.chip}
                onClick={() => openAiWith(c.prompt)}
              >
                <Icon name={c.icon} size="16px" />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </section>

        <hr className={styles.divider} />

        <div className={styles.tileGrid}>
          {HOME_STAT_TILES.map((t, i) => (
            <div key={t.label} className={styles.tile}>
              <span className={styles.tileHeader}>
                <span className={styles.tileLabel}>{t.label}</span>
                <IconButton icon="DotsThree" ariaLabel={`${t.label} options`} size="s" />
              </span>
              <span className={styles.tileValue}>{t.value}</span>
              <Sparkline data={t.spark} delay={i * 90} />
            </div>
          ))}
        </div>

        <br />

        <section className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>Quick actions</h2>
          <div className={styles.cardGrid}>
            {HOME_ACTION_CARDS.map((c) => (
              <a key={c.title} href={c.route} className={styles.card} onClick={go(c.route)}>
                <span className={styles.cardBody}>
                  <span className={styles.cardTitle}>{c.title}</span>
                  <span className={styles.cardDesc}>{c.description}</span>
                </span>
                <span className={styles.cardLink}>
                  <span>{c.linkLabel}</span>
                  <Icon name="ArrowRight" size="16px" />
                </span>
              </a>
            ))}
          </div>
        </section>
        
      </div>
    </AppShell>
  );
}

/** Dummy sparkline built with d3-shape — a stretched line + faint area fill. */
function Sparkline({ data, delay = 0 }: { data: number[]; delay?: number }) {
  const W = 240;
  const H = 56;
  const { linePath, areaPath } = useMemo(() => {
    const x = scaleLinear().domain([0, Math.max(data.length - 1, 1)]).range([0, W]);
    const y = scaleLinear()
      .domain([0, Math.max(...data, 1)])
      .range([H - 2, 2]);
    const l = d3line<number>()
      .x((_, i) => x(i))
      .y((d) => y(d))
      .curve(curveMonotoneX);
    const a = d3area<number>()
      .x((_, i) => x(i))
      .y0(H)
      .y1((d) => y(d))
      .curve(curveMonotoneX);
    return { linePath: l(data) ?? '', areaPath: a(data) ?? '' };
  }, [data]);

  return (
    <svg
      className={styles.spark}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className={styles.sparkFill} d={areaPath} style={{ animationDelay: `${delay}ms` }} />
      <path
        className={styles.sparkLine}
        d={linePath}
        pathLength={1}
        style={{ animationDelay: `${delay}ms` }}
      />
    </svg>
  );
}
