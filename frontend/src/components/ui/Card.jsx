export const Card = ({ children, className = '', glass = false, ...props }) => (
  <div
    className={`${glass ? 'glass-card' : 'card'} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
