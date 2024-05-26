// components/Platform/NavigationBar.js
import Link from 'next/link';
import styles from '../../styles/navigationbar.module.css';
import { useRouter } from 'next/router';

const navigationLinks = [
  { name: 'Agent', href: '/platform/agents' },
  { name: 'Newsletters', href: '/platform/newsletters' },
  { name: 'Video Chat (Soon)', href: '#', disabled: true },
  { name: 'Pricing', href: '/platform/pricing' },
];

const NavigationBar = () => {
  const router = useRouter();
  return (
    <nav className={styles.navigationBar}>
      {navigationLinks.map((link) => (
        <div key={link.name} className={styles.navItemWrapper}>
          {link.disabled ? (
            <span
              className={`${styles.navItem} ${styles.navItemDisabled}`}
              title="Coming Soon"
            >
              {link.name}
            </span>
          ) : (
            <Link href={link.href} legacyBehavior>
              <a
                className={`${styles.navItem} ${
                  router.pathname === link.href ? styles.navItemActive : ''
                }`}
              >
                {link.name}
              </a>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default NavigationBar;
