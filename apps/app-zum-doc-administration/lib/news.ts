export type PracticeNewsItem = {
  id: string,
  date: Date,
  imageSrc: string,
  title: {
    'de-DE': string,
    'en-US': string,
  },
  body: {
    'de-DE': string,
    'en-US': string,
  },
}

export const practiceNews: PracticeNewsItem[] = [
  {
    id: 'news-billing-2025',
    date: new Date(2025, 1, 19),
    imageSrc: '/images/news-billing.jpg',
    title: {
      'de-DE': 'Neue Abrechnungsrichtlinien 2025 für Hausarztpraxen',
      'en-US': 'New 2025 billing guidelines for GP practices',
    },
    body: {
      'de-DE': 'Ab März gelten aktualisierte GOP-Ziffern. Wir haben die wichtigsten Änderungen für Ihre Praxis zusammengefasst.',
      'en-US': 'Updated fee schedule items apply from March. Here are the most important changes for your practice.',
    },
  },
  {
    id: 'news-conference',
    date: new Date(2025, 0, 8),
    imageSrc: '/images/news-conference.jpg',
    title: {
      'de-DE': 'Digitalgipfel: eAU und eRezept im Praxisalltag',
      'en-US': 'Digital summit: eAU and e-prescriptions in daily practice',
    },
    body: {
      'de-DE': 'Ein Rückblick auf Workflows, die Wartezeiten verkürzen und das Team in der Anmeldung entlasten.',
      'en-US': 'A look at workflows that shorten waiting times and ease the load on reception teams.',
    },
  },
]
