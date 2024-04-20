import Link from 'next/link';
import styles from '../../styles/navigationbar.module.css';
import { useRouter } from 'next/router';

const navigationLinks = [
  { name: 'Agent', href: '/platform/agents' },
  { name: 'Newsletters', href: '/platform/newsletters' },
];

const NavigationBar = () => {
  const router = useRouter();
  return (
    <nav className={styles.navigationBar}>
      {navigationLinks.map((link) => (
        <Link href={link.href} key={link.name} legacyBehavior>
          <a
            className={`${styles.navItem} ${
              router.pathname === link.href ? styles.navItemActive : ''
            }`}
          >
            {link.name}
          </a>
        </Link>
      ))}
    </nav>
  );
};

export default NavigationBar;
