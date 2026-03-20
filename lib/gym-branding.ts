import { Gym } from "@prisma/client"

export function getGymBranding(gym: Partial<Gym> | null | undefined) {
  if (!gym) return null

  const initials = gym.name
    ? gym.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'GP'

  const defaultShowcase1 = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48'
  const defaultShowcase2 = 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f'

  let finalShowcase1 = gym.showcaseImage1 || defaultShowcase1
  let finalShowcase2 = gym.showcaseImage2 || defaultShowcase2

  // If only one showcase image exists, duplicate it for UI consistency
  if (gym.showcaseImage1 && !gym.showcaseImage2) {
    finalShowcase2 = gym.showcaseImage1
  } else if (!gym.showcaseImage1 && gym.showcaseImage2) {
    finalShowcase1 = gym.showcaseImage2
  }

  return {
    name: gym.name || 'GymPilotPro',
    initials,
    logo: gym.logo || null,
    primaryColor: gym.primaryColor || '#daa857',
    secondaryColor: gym.secondaryColor || '#000000',
    heroTitle: gym.heroTitle || gym.name || 'Welcome to GymPilotPro',
    heroSubtitle: gym.heroSubtitle || gym.tagline || 'Transform Your Body, Transform Your Life',
    heroVideo: gym.heroVideo || '/istockphoto-2013957555-640_adpp_is.mp4',
    showcaseImage1: finalShowcase1,
    showcaseImage2: finalShowcase2,
    tagline: gym.tagline || null,
    coverImage: gym.coverImage || null,
    favicon: gym.favicon || null,
  }
}
