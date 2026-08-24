function Icon({ path, className = 'h-5 w-5', strokeWidth = 2, ...rest }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth} {...rest}>
      {path}
    </svg>
  );
}

export const HomeIcon = (props) => (
  <Icon
    {...props}
    path={
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h4a1 1 0 001-1V10"
      />
    }
  />
);

export const SettingsIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <circle cx="12" cy="12" r="3" />
      </>
    }
  />
);

export const LogOutIcon = (props) => (
  <Icon
    {...props}
    path={
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    }
  />
);

export const MenuIcon = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />} />
);

export const CloseIcon = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />} />
);

export const EyeIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <circle cx="12" cy="12" r="3" />
      </>
    }
  />
);

export const BriefcaseIcon = (props) => (
  <Icon
    {...props}
    path={
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7h-3V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2H4a1 1 0 00-1 1v10a2 2 0 002 2h14a2 2 0 002-2V8a1 1 0 00-1-1zM9 5h6v2H9V5z"
      />
    }
  />
);

export const ImageIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
      </>
    }
  />
);

export const BookIcon = (props) => (
  <Icon
    {...props}
    path={
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    }
  />
);

export const TrashIcon = (props) => (
  <Icon
    {...props}
    path={
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
      />
    }
  />
);

export const PlusIcon = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />} />
);

export const SaveIcon = (props) => (
  <Icon
    {...props}
    path={
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 21v-8H7v8M7 3v5h8M5 3h11l4 4v11a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
      />
    }
  />
);

export const ArrowLeftIcon = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />} />
);

export const ClipboardCheckIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2 2 4-4" />
      </>
    }
  />
);

export const AwardIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <circle cx="12" cy="8" r="5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5L7 21l5-3 5 3-1.5-8.5" />
      </>
    }
  />
);

export const MailIcon = (props) => (
  <Icon
    {...props}
    path={
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    }
  />
);

export const IdCardIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="11.5" r="1.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 16c.6-1.4 1.8-2.1 3-2.1s2.4.7 3 2.1M14 10h4M14 13.5h4" />
      </>
    }
  />
);

export const PhoneIcon = (props) => (
  <Icon
    {...props}
    path={
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h2.28a1 1 0 011 .76l.72 3.13a1 1 0 01-.29.95l-1.4 1.4a12.06 12.06 0 006 6l1.4-1.4a1 1 0 01.95-.29l3.13.72a1 1 0 01.76 1V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z"
      />
    }
  />
);

export const PencilIcon = (props) => (
  <Icon
    {...props}
    path={
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 013 3L12 16l-4 1 1-4 9.5-9.5z"
      />
    }
  />
);

export const UserCircleIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="10" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.2 18.2a6 6 0 0111.6 0" />
      </>
    }
  />
);

export const FileTextIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v4a1 1 0 001 1h4M6 3h8l6 6v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 13h8M8 17h5" />
      </>
    }
  />
);

export const PaletteIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9 9 0 110-18 8 8 0 018 8c0 1.5-.5 3-2.5 3H15a2 2 0 00-1.2 3.6c.5.4.7 1 .3 1.6-.4.6-1.2.8-2.1.8z"
        />
        <circle cx="7.5" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="10.5" cy="7" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
      </>
    }
  />
);

export const Share2Icon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.6 10.6l6.8-3.9M8.6 13.4l6.8 3.9" />
      </>
    }
  />
);

export const SparklesIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.8 4.6L18 9.5l-4.2 1.9L12 16l-1.8-4.6L6 9.5l4.2-1.9L12 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8L19 14z" />
      </>
    }
  />
);

export const TimerIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <circle cx="12" cy="13" r="8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4l3 2M9 2h6" />
      </>
    }
  />
);

export const GraduationCapIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 8l10-5 10 5-10 5-10-5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5M22 8v6" />
      </>
    }
  />
);
