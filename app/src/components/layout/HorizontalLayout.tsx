export default function HorizontalLayout({
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
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          ...style,
        }}
      >
        {children}
      </div>
    )
  }
  