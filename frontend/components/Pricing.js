import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { FaPodcast, FaChartLine, FaInfinity, FaHistory } from "react-icons/fa";
import { TbBoxMultiple } from "react-icons/tb";
import { IoChatboxEllipses } from "react-icons/io5";
import { RiDownloadCloudFill } from "react-icons/ri";
import ButtonOutline from "./misc/ButtonOutline";
import getScrollAnimation from "../utils/getScrollAnimation";
import ScrollAnimationWrapper from "./Layout/ScrollAnimationWrapper";
import styles from "../styles/pricinghomepage.module.css";

const Pricing = () => {
  const scrollAnimation = useMemo(() => getScrollAnimation(), []);

  return (
    <div className={styles.pricingSection} id="pricing">
      <div className={styles.pricingContainer}>
        <div className="flex flex-col w-full">
          <ScrollAnimationWrapper>
            <motion.h3
              variants={scrollAnimation}
              className={styles.sectionHeader}
            >
              Choose Your Plan
            </motion.h3>
            <motion.p
              variants={scrollAnimation}
              className={styles.sectionSubHeader}
            >
              Let's choose the package that is best for you and explore it happily and cheerfully.
            </motion.p>
          </ScrollAnimationWrapper>
          <div className={styles.pricingGrid}>
            <ScrollAnimationWrapper className="flex justify-center">
              <motion.div
                variants={scrollAnimation}
                className={`${styles.pricingCard} ${styles.pricingCardInitial} ${styles.pricingCardAnimate}`}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <div className="p-4 lg:p-0 mt-6 lg:mt-8"></div>
                <p className={styles.planHeader}>Rookie</p>
                <ul className={styles.planFeatures}>
                  <li className={styles.planFeature}>
                    <TbBoxMultiple className={styles.planFeatureIcon} /> 2 podcasts
                  </li>
                  <li className={styles.planFeature}>
                    <FaPodcast className={styles.planFeatureIcon} /> Pick and Choose Any Youtube Podcasts
                  </li>
                  <li className={styles.planFeature}>
                    <FaChartLine className={styles.planFeatureIcon} /> Charts, Data Tables and Headlines
                  </li>
                  <li className={styles.planFeature}>
                    <FaHistory className={styles.planFeatureIcon} /> Access All Your Past Newsletters
                  </li>
                </ul>
                <div className={styles.buttonContainer}>
                  <p className={styles.planPrice}>Free</p>
                  <ButtonOutline href="/signup">Select</ButtonOutline>
                </div>
              </motion.div>
            </ScrollAnimationWrapper>
            <ScrollAnimationWrapper className="flex justify-center">
              <motion.div
                variants={scrollAnimation}
                className={`${styles.pricingCard} ${styles.pricingCardInitial} ${styles.pricingCardAnimate}`}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <div className="p-4 lg:p-0 mt-6 lg:mt-8"></div>
                <p className={styles.planHeader}>Agent 007</p>
                <ul className={styles.planFeatures}>
                  <li className={styles.planFeature}>
                    <FaInfinity className={styles.planFeatureIcon} /> Unlimited Youtube Podcasts
                  </li>
                  <li className={styles.planFeature}>
                    <IoChatboxEllipses className={styles.planFeatureIcon} /> Video Chat
                  </li>
                  <li className={styles.planFeature}>
                    <FaPodcast className={styles.planFeatureIcon} /> Pick and Choose Any Youtube Podcasts
                  </li>
                  <li className={styles.planFeature}>
                    <FaChartLine className={styles.planFeatureIcon} /> Charts, Data Tables and Headlines
                  </li>
                  <li className={styles.planFeature}>
                    <FaHistory className={styles.planFeatureIcon} /> Access all your past newsletters
                  </li>
                  <li className={styles.planFeature}>
                    <RiDownloadCloudFill className={styles.planFeatureIcon} /> Download as a PDF
                  </li>
                </ul>
                <div className={styles.buttonContainer}>
                  <p className={styles.planPrice}>
                    $9.99 <span className="text-black-500">/ mo</span>
                  </p>
                  <ButtonOutline href="/signup">Select</ButtonOutline>
                </div>
              </motion.div>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
