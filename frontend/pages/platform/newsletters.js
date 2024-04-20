import Layout from '../../components/Platform/Layout';

const Newsletters = () => {
  return (
    <Layout>
      <div className="agents-container">
        <section className="creators">
          <p>Newsletters</p>
        </section>
        <section className="configurations">
          {/* Content for configurations */}
        </section>

        <style jsx>{`
          .agents-container {
            display: flex;
            justify-content: space-between;
          }

          .creators,
          .configurations {
            flex: 1; // This will divide space equally between the two
            padding: 20px; // Adjust padding as needed
            margin-right: 10px; // For spacing between the columns
          }

          // Adjust the last column to not have margin on the right
          .configurations {
            margin-right: 0;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default Newsletters;

