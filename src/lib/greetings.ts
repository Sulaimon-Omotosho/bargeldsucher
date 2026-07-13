export function getDynamicGreeting(name?: string | null): {
  title: string
  subtitle: string
  icon: string
} {
  const hour = new Date().getHours()
  const fallbackName = name ? `, ${name.split(' ')[0]}` : ''

  if (hour < 12) {
    return {
      title: `Good morning${fallbackName}`,
      subtitle: "Here's your cash summary for today.",
      icon: '🌅',
    }
  } else if (hour < 17) {
    return {
      title: `Good afternoon${fallbackName}`,
      subtitle: 'Keep an eye on active logs and balance loops.',
      icon: '☀️',
    }
  } else {
    return {
      title: `Good evening${fallbackName}`,
      subtitle: 'Reviewing your operational overhead logs.',
      icon: '🌆',
    }
  }
}
