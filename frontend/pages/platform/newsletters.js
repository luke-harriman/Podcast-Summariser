import React, { useState, useEffect } from 'react';
import Layout from '../../components/Platform/Layout';
import NewsletterBlock from '../../components/Platform/NewsletterBlock';
import { fetchData } from '../../lib/api';
import { calculateProgressToNextSunday, groupNewslettersByWeek } from '../../lib/utils';
import { useSession, getSession } from 'next-auth/react';

const Newsletters = ({ initialNewsletters, nextSundayDate }) => {
  const [newsletters, setNewsletters] = useState(initialNewsletters);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      setProgress(calculateProgressToNextSunday());
    };

    const intervalId = setInterval(() => {
      updateProgress();
    }, 1000); // Update progress every second

    updateProgress(); // Initial call to set the progress

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const groupedNewsletters = groupNewslettersByWeek(newsletters);

  return (
    <Layout>
      <div className="progress-bar-container">
        <p className="progress-title">Next Recon Coming In at {nextSundayDate}</p>
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="agents-container">
        {Object.keys(groupedNewsletters).map(weekKey => (
          <div key={weekKey} className="week-group">
            <h2 className="date-header">{new Date(weekKey).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h2>
            <div className="divider"></div>
            <section className="creators">
              {groupedNewsletters[weekKey].map(newsletter => (
                <NewsletterBlock key={newsletter.id} newsletter={newsletter} />
              ))}
            </section>
          </div>
        ))}
        <section className="configurations">
          {/* Additional content or configurations */}
        </section>
      </div>
      <style jsx>{`
        .progress-bar-container {
          position: relative;
          height: 50px; /* Adjust height to accommodate title and bar */
          background-color: #f3f3f3;
          margin: 20px auto; /* Center the progress bar and add top margin */
          border-radius: 5px;
          overflow: hidden;
          padding: 10px;
          text-align: center;
          width: 50%; /* Set the width to 50% */
        }
        .progress-title {
          margin: 0;
          margin-bottom: 5px; /* Add margin to separate title from the bar */
        }
        .progress-bar {
          height: 8px;
          background-color: #4caf50;
          transition: width 0.5s ease;
        }
        .agents-container {
          display: flex;
          flex-direction: column;
          margin-top: 20px; /* Add top margin to create gap between nav bar and newsletter blocks */
          margin-left: 20px; /* Add left margin to create gap between nav bar and content */
        }
        .week-group {
          margin-bottom: 40px;
        }
        .date-header {
          font-size: 1.5em; /* Make the date larger */
          margin-bottom: 10px;
        }
        .divider {
          height: 1px; /* Divider height */
          background-color: #e0e0e0;
          margin-bottom: 20px;
        }
        .creators {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* Adjusted for dynamic sizing */
          gap: 20px; /* Adding gap between the newsletters */
        }
        .configurations {
          padding: 20px;
          margin-top: 20px;
        }
      `}</style>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }

  const newsletters = await fetchData(session.user.id);

  // Calculate and set the next Sunday date
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(0, 0, 0, 0);
  const nextSundayDate = nextSunday.toLocaleDateString();

  return {
    props: {
      initialNewsletters: newsletters,
      nextSundayDate,
    },
  };
}

export default Newsletters;


// The newsletters are not in order of date
// Only display newsletters that have the keywords I am looking for. 
// Only render the images if the multi-media is set to true.
// Render the newsletters for each specific date range based on the date ranges in the weekly_user_configuration_snapshot table.
// Gap between pricing card on pricing page needs to be decreased.
