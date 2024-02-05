export default function VerticalLayout({
    children,
    style,
    center = false,
    fullWidth = false,
    horizontalAutoMargin = false,
  }: {
    children?: React.ReactNode
    style?: React.CSSProperties
    center?: boolean
    fullWidth?: boolean
    horizontalAutoMargin?: boolean
  }) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: center ? 'center' : 'flex-start',
          height: '100%',
          width: fullWidth ? '100%' : 'auto',
          margin: horizontalAutoMargin ? '0 auto' : '0',
          ...style,
        }}
      >
        {children}
      </div>
    )
  }
  