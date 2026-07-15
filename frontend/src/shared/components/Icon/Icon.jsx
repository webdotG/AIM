import clsx from 'clsx';

export default function Icon({ name, size = 24, color, className = '', ...props }) {
  const classes = clsx('icon', `icon--${size}`, className);

  return (
    <svg
      className={classes}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {getIcon(name)}
    </svg>
  );
}

function getIcon(name) {
  switch (name) {
    case 'home': return <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />;
    case 'plus': return <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>;
    case 'search': return <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>;
    case 'arrow-left': return <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="11 17 6 12 11 7" /></>;
    case 'arrow-right': return <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 17 18 12 13 7" /></>;
    case 'arrow-up': return <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="17 11 12 6 7 11" /></>;
    case 'arrow-down': return <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 13 14 18 9 13" /></>;
    case 'edit': return <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />;
    case 'trash': return <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></>;
    case 'heart': return <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />;
    case 'settings': return <circle cx="12" cy="12" r="3" />;
    case 'chart': return <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>;
    case 'user': return <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>;
    case 'tag': return <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />;
    case 'layers': return <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>;
    case 'image': return <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>;
    case 'x': return <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>;
    case 'check': return <polyline points="20 6 9 17 4 12" />;
    case 'menu': return <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>;
    default: return null;
  }
}