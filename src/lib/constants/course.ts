// src/lib/constants/course.ts

export const MOCK_MODULES = [
  {
    _id: 'mod-1',
    title: 'Introducción a la Cestería',
    description: 'Aprende los conceptos básicos y herramientas necesarias.',
    order: 1,
    lessons: [
      {
        _id: 'les-1',
        title: 'Bienvenida al curso',
        description: 'Una breve introducción a lo que aprenderás.',
        videoUrl: 'https://www.youtube.com/watch?v=kYfNvmF0Bqw',
        videoType: 'youtube',
        duration: 5,
        order: 1,
        isPreview: true,
      },
      {
        _id: 'les-2',
        title: 'Herramientas y materiales',
        description: 'Todo lo que necesitas para empezar tu primer proyecto.',
        videoUrl: 'https://www.youtube.com/watch?v=V9YfshY_YQk',
        videoType: 'youtube',
        duration: 15,
        order: 2,
        isPreview: false,
      }
    ]
  },
  {
    _id: 'mod-2',
    title: 'Técnicas de Tejido',
    description: 'Profundizando en los puntos básicos.',
    order: 2,
    lessons: [
      {
        _id: 'les-3',
        title: 'El punto espiral',
        description: 'La base de la mayoría de los canastos.',
        videoUrl: 'https://www.youtube.com/watch?v=R9K-Z0_A9-k',
        videoType: 'youtube',
        duration: 20,
        order: 1,
        isPreview: false,
      },
      {
        _id: 'les-4',
        title: 'Cierres y terminaciones',
        description: 'Cómo finalizar tus piezas de forma profesional.',
        videoUrl: 'https://www.youtube.com/watch?v=M7lz76L-WCc',
        videoType: 'youtube',
        duration: 12,
        order: 2,
        isPreview: false,
      }
    ]
  }
];
