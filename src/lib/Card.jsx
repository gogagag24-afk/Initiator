import { colors, radii, transitions } from '../lib/tokens';

export default function Card({ children, onClick, hover = true, className = '', style = {} }) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: colors.bg.card,
        border: `1px solid ${colors.border.default}`,
        borderRadius: radii.lg,
        padding: `${spacing.xl}px ${spacing['2xl']}px`,
        cursor: onClick ? 'pointer' : 'default',
        transition: transitions.normal,
        ...hover && onClick && {
          ':hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.3)', transform: 'translateY(-2px)', borderColor: colors.border.active }
        },
        ...style,
      }}
    >
      {children}
    </div>
  );
}
