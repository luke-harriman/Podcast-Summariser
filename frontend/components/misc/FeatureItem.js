const FeatureItem = ({ children }) => {
    return (
      <li className="flex items-center">
        <svg className="text-green-500 w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {children}
      </li>
    );
  };
  
  export default FeatureItem;