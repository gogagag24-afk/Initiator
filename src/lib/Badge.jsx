import { colors, fonts, radii } from '../lib/tokens';

const config = {
  collecting: { label: 'ხმების კრება', color: colors.status.collecting, bg: colors.statusBg.collecting },
  sent: { label: 'გაგზავნილია', color: colors.status.sent, bg: colors.statusBg.sent },
  received: { label: 'მიღებულია', color: colors.status.received, bg: colors.statusBg.received },
  numbered: { label: 'დარეგისტრირდა', color: colors.status.numbered, bg: colors.statusBg.numbered },
  scheduled: { label: 'განხილვა დაინიშნა', color: colors.status.scheduled, bg: colors.statusBg.scheduled },
  resolved: { label: 'გადაწყდა', color: colors.status.resolved, bg: colors.statusBg.resolved },
};

export default function Badge({ status }) {
  const c = config[status] || config.collecting;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '3px 8px', borderRadius: radii.sm,
      color: c.color, background: c.bg, fontFamily: fonts.mono,
      border: `1px solid ${c.color}30`,
    }}>
      {c.label}
    </span>
  );
}
