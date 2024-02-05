export default function CenteredLayout({
    children,
    style,
  }: {
    children: React.ReactNode
    style?: React.CSSProperties
  }) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          ...style,
        }}
      >
        {children}
      </div>
    )
  }
  