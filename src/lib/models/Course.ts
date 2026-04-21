// src/lib/models/Course.ts
// Modelos para módulos y lecciones del curso

import mongoose, { Document, Schema, Model } from 'mongoose';

// ─── Lesson ──────────────────────────────────────────────────────────────────
export interface ILesson extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;      // URL de YouTube, Vimeo o archivo directo
  videoType: 'youtube' | 'vimeo' | 'direct';
  duration: number;      // en minutos
  order: number;
  isPreview: boolean;    // Si es true, es accesible sin pago
  moduleId: mongoose.Types.ObjectId;
}

const LessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    videoUrl: { type: String, required: true },
    videoType: {
      type: String,
      enum: ['youtube', 'vimeo', 'direct'],
      default: 'youtube',
    },
    duration: { type: Number, default: 0 },
    order: { type: Number, required: true },
    isPreview: { type: Boolean, default: false },
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
  },
  { timestamps: true }
);

// ─── Module ───────────────────────────────────────────────────────────────────
export interface IModule extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  order: number;
  lessons: ILesson[];
}

const ModuleSchema = new Schema<IModule>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    order: { type: Number, required: true },
    lessons: [LessonSchema],
  },
  { timestamps: true }
);

export const Lesson: Model<ILesson> =
  mongoose.models.Lesson ?? mongoose.model<ILesson>('Lesson', LessonSchema);

export const Module: Model<IModule> =
  mongoose.models.Module ?? mongoose.model<IModule>('Module', ModuleSchema);
