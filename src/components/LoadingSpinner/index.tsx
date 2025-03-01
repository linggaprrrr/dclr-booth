export const LoadingSpinner = ({ 
  size = 40, 
  color = "#3B82F6", 
  secondaryColor = "#DBEAFE",
  strokeWidth = 4,
  speed = 1.5 
}) => {
  const viewBoxSize = 100;
  const center = viewBoxSize / 2;
  const radius = (viewBoxSize - strokeWidth) / 2 * 0.8;

  return (
    <div className="flex items-center justify-center">
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={secondaryColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Animated spinner */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * radius * 0.75} ${2 * Math.PI * radius * 0.25}`}
          className={`animate-spin origin-center`}
          style={{ 
            animationDuration: `${speed}s`,
            transformOrigin: 'center'
          }}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${center} ${center}`}
            to={`360 ${center} ${center}`}
            dur={`${speed}s`}
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};