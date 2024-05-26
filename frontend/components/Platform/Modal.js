import styles from '../../styles/modal.module.css';

const Modal = ({ isOpen, onClose, onConfirm, periodEnd }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Cancel Subscription</h2>
        <p>Are you sure you want to cancel your subscription? If so, your premium features will last until {periodEnd}.</p>
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onClose}>No, keep my subscription</button>
          <button className={styles.confirmButton} onClick={onConfirm}>Yes, cancel my subscription</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
