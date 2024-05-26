import styles from '../../styles/pricing.module.css';
import { FaPodcast, FaChartLine, FaHistory, FaInfinity } from 'react-icons/fa';
import { IoChatboxEllipses } from 'react-icons/io5';
import { RiDownloadCloudFill } from 'react-icons/ri';

const PricingCard = ({ plan, price, features, isCurrentPlan, onSubscribe }) => {
  return (
    <div className={styles.card}>
      <h2>{plan}</h2>
      <p className={styles.price}>{price}</p>
      <ul>
        {features.map((feature, index) => (
          <li key={index} className={styles.featureItem}>
            {feature.icon}
            {feature.text}
          </li>
        ))}
      </ul>
      <div className={styles.buttonContainer}>
        {isCurrentPlan ? (
          <button className={styles.currentPlan}>Current Plan</button>
        ) : (
          <button onClick={onSubscribe} className={styles.subscribe}>Subscribe</button>
        )}
      </div>
    </div>
  );
};

export default PricingCard;
