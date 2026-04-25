import { colors, fonts, radii } from '../lib/tokens';

export default function ProgressBar({ votes, limit }) {
  const pct = Math.min((votes / limit) * 100, 100);
  const color = pct >= 90 ? colors.status.scheduled : pct >= 60 ? colors.status.collecting : colors.status.sent;
  
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: colors.text.muted, marginBottom: 4, fontFamily: fonts.mono }}>
        <span>{votes.toLocaleString('ka-GE')} ხმა</span>
        <span>ლიმიტი: {limit.toLocaleString('ka-GE')}</span>
      </div>
      <div style={{ height: 6, background: colors.border.default, borderRadius: radii.sm, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: radii.sm, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
      <div style={{ fontSize: 10, color, marginTop: 3, fontFamily: fonts.mono, fontWeight: 600 }}>{pct.toFixed(1)}% შესრულებული</div>
    </div>
  );
}
