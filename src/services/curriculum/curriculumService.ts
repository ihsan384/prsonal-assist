import { memoryStore } from '@/services/storage/MemoryStore'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import { generateId } from '@/utils/format'
import { supabase, isSupabaseConfigured } from '@/services/supabase/supabase'
import type {
  Board, AcademicStream, SubjectCombination, MasterSubject,
  MasterChapter, CombinationSubject, UserSubject, Subject, Chapter
} from '@/types/study.types'

// ─── MASTER CURRICULUM DATA SEED ──────────────────────────────────────────────

export const DEFAULT_BOARDS: Board[] = [
  { id: 'board-plus-one', name: 'Kerala HSE / State Board', code: 'KERALA_HSE' },
  { id: 'board-cbse', name: 'CBSE (Central Board)', code: 'CBSE' },
  { id: 'board-isc', name: 'ISC / ICSE Board', code: 'ISC' },
]

export const DEFAULT_STREAMS: AcademicStream[] = [
  // Plus One Streams
  { id: 'str-p1-sci', boardId: 'board-plus-one', classLevel: 'Plus One', name: 'Science', code: 'SCIENCE_P1' },
  { id: 'str-p1-com', boardId: 'board-plus-one', classLevel: 'Plus One', name: 'Commerce', code: 'COMMERCE_P1' },

  // Plus Two Streams
  { id: 'str-p2-sci', boardId: 'board-plus-one', classLevel: 'Plus Two', name: 'Science', code: 'SCIENCE_P2' },
  { id: 'str-p2-com', boardId: 'board-plus-one', classLevel: 'Plus Two', name: 'Commerce', code: 'COMMERCE_P2' },

  // CBSE Class 11 & 12
  { id: 'str-cbse-c11-sci', boardId: 'board-cbse', classLevel: 'Class 11', name: 'Science', code: 'CBSE_C11_SCI' },
  { id: 'str-cbse-c11-com', boardId: 'board-cbse', classLevel: 'Class 11', name: 'Commerce', code: 'CBSE_C11_COM' },
  { id: 'str-cbse-c12-sci', boardId: 'board-cbse', classLevel: 'Class 12', name: 'Science', code: 'CBSE_C12_SCI' },
  { id: 'str-cbse-c12-com', boardId: 'board-cbse', classLevel: 'Class 12', name: 'Commerce', code: 'CBSE_C12_COM' },
]

export const DEFAULT_COMBINATIONS: SubjectCombination[] = [
  // Plus One Combinations
  { id: 'comb-p1-pcm', streamId: 'str-p1-sci', name: 'PCM (Physics, Chemistry, Mathematics)', code: 'PCM' },
  { id: 'comb-p1-pcmb', streamId: 'str-p1-sci', name: 'PCMB (Physics, Chemistry, Mathematics, Biology)', code: 'PCMB' },
  { id: 'comb-p1-commerce-core', streamId: 'str-p1-com', name: 'Commerce Core (Accountancy, Business Studies, Economics)', code: 'COMMERCE_CORE' },

  // Plus Two Combinations
  { id: 'comb-p2-pcm', streamId: 'str-p2-sci', name: 'PCM (Physics, Chemistry, Mathematics)', code: 'PCM_P2' },
  { id: 'comb-p2-pcmb', streamId: 'str-p2-sci', name: 'PCMB (Physics, Chemistry, Mathematics, Biology)', code: 'PCMB_P2' },
  { id: 'comb-p2-commerce-core', streamId: 'str-p2-com', name: 'Commerce Core (Accountancy, Business Studies, Economics)', code: 'COMMERCE_CORE_P2' },

  // CBSE Class 11 & 12 Combinations
  { id: 'comb-cbse-c11-pcm', streamId: 'str-cbse-c11-sci', name: 'PCM (Physics, Chemistry, Mathematics)', code: 'CBSE_C11_PCM' },
  { id: 'comb-cbse-c11-pcmb', streamId: 'str-cbse-c11-sci', name: 'PCMB (Physics, Chemistry, Mathematics, Biology)', code: 'CBSE_C11_PCMB' },
  { id: 'comb-cbse-c12-pcm', streamId: 'str-cbse-c12-sci', name: 'PCM (Physics, Chemistry, Mathematics)', code: 'CBSE_C12_PCM' },
  { id: 'comb-cbse-c12-pcmb', streamId: 'str-cbse-c12-sci', name: 'PCMB (Physics, Chemistry, Mathematics, Biology)', code: 'CBSE_C12_PCMB' },
]

export const DEFAULT_MASTER_SUBJECTS: MasterSubject[] = [
  { id: 'sub-phy', name: 'Physics', code: 'PHY', icon: 'Atom', color: '#3b82f6' },
  { id: 'sub-chem', name: 'Chemistry', code: 'CHEM', icon: 'FlaskConical', color: '#ec4899' },
  { id: 'sub-math', name: 'Mathematics', code: 'MATH', icon: 'Calculator', color: '#8b5cf6' },
  { id: 'sub-bio', name: 'Biology', code: 'BIO', icon: 'Dna', color: '#84cc16' },
  { id: 'sub-acc', name: 'Accountancy', code: 'ACC', icon: 'Receipt', color: '#06b6d4' },
  { id: 'sub-bst', name: 'Business Studies', code: 'BST', icon: 'Briefcase', color: '#6366f1' },
  { id: 'sub-eco', name: 'Economics', code: 'ECO', icon: 'TrendingUp', color: '#14b8a6' },
]

export const DEFAULT_COMBINATION_SUBJECTS: CombinationSubject[] = [
  // Plus One Mappings
  { combinationId: 'comb-p1-pcm', subjectId: 'sub-phy' },
  { combinationId: 'comb-p1-pcm', subjectId: 'sub-chem' },
  { combinationId: 'comb-p1-pcm', subjectId: 'sub-math' },

  { combinationId: 'comb-p1-pcmb', subjectId: 'sub-phy' },
  { combinationId: 'comb-p1-pcmb', subjectId: 'sub-chem' },
  { combinationId: 'comb-p1-pcmb', subjectId: 'sub-math' },
  { combinationId: 'comb-p1-pcmb', subjectId: 'sub-bio' },

  { combinationId: 'comb-p1-commerce-core', subjectId: 'sub-acc' },
  { combinationId: 'comb-p1-commerce-core', subjectId: 'sub-bst' },
  { combinationId: 'comb-p1-commerce-core', subjectId: 'sub-eco' },

  // Plus Two Mappings
  { combinationId: 'comb-p2-pcm', subjectId: 'sub-phy' },
  { combinationId: 'comb-p2-pcm', subjectId: 'sub-chem' },
  { combinationId: 'comb-p2-pcm', subjectId: 'sub-math' },

  { combinationId: 'comb-p2-pcmb', subjectId: 'sub-phy' },
  { combinationId: 'comb-p2-pcmb', subjectId: 'sub-chem' },
  { combinationId: 'comb-p2-pcmb', subjectId: 'sub-math' },
  { combinationId: 'comb-p2-pcmb', subjectId: 'sub-bio' },

  { combinationId: 'comb-p2-commerce-core', subjectId: 'sub-acc' },
  { combinationId: 'comb-p2-commerce-core', subjectId: 'sub-bst' },
  { combinationId: 'comb-p2-commerce-core', subjectId: 'sub-eco' },

  // CBSE Mappings
  { combinationId: 'comb-cbse-c11-pcm', subjectId: 'sub-phy' },
  { combinationId: 'comb-cbse-c11-pcm', subjectId: 'sub-chem' },
  { combinationId: 'comb-cbse-c11-pcm', subjectId: 'sub-math' },

  { combinationId: 'comb-cbse-c12-pcm', subjectId: 'sub-phy' },
  { combinationId: 'comb-cbse-c12-pcm', subjectId: 'sub-chem' },
  { combinationId: 'comb-cbse-c12-pcm', subjectId: 'sub-math' },
]

export const DEFAULT_MASTER_CHAPTERS: MasterChapter[] = [
  // ============================================================================
  // ─── PLUS ONE MASTER CHAPTERS (78 Chapters) ─────────────────────────────────
  // ============================================================================

  // ─── PHYSICS — Plus One (14 Chapters) ───────────────────────────────────────
  { id: 'mch-phy-p1-1', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 1, chapterName: 'Units and Measurements', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 1, estimatedHours: 6 },
  { id: 'mch-phy-p1-2', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 2, chapterName: 'Motion in a Straight Line', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 2, estimatedHours: 7 },
  { id: 'mch-phy-p1-3', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 3, chapterName: 'Motion in a Plane', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 3, estimatedHours: 8 },
  { id: 'mch-phy-p1-4', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 4, chapterName: 'Laws of Motion', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 4, estimatedHours: 9 },
  { id: 'mch-phy-p1-5', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 5, chapterName: 'Work, Energy, and Power', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 5, estimatedHours: 8 },
  { id: 'mch-phy-p1-6', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 6, chapterName: 'System of Particles and Rotational Motion', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 6, estimatedHours: 10 },
  { id: 'mch-phy-p1-7', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 7, chapterName: 'Gravitation', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 7, estimatedHours: 7 },
  { id: 'mch-phy-p1-8', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 8, chapterName: 'Mechanical Properties of Solids', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 8, estimatedHours: 5 },
  { id: 'mch-phy-p1-9', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 9, chapterName: 'Mechanical Properties of Fluids', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 9, estimatedHours: 8 },
  { id: 'mch-phy-p1-10', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 10, chapterName: 'Thermal Properties of Matter', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 10, estimatedHours: 6 },
  { id: 'mch-phy-p1-11', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 11, chapterName: 'Thermodynamics', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 11, estimatedHours: 7 },
  { id: 'mch-phy-p1-12', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 12, chapterName: 'Kinetic Theory', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 12, estimatedHours: 5 },
  { id: 'mch-phy-p1-13', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 13, chapterName: 'Oscillations', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 13, estimatedHours: 8 },
  { id: 'mch-phy-p1-14', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 14, chapterName: 'Waves', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 14, estimatedHours: 8 },

  // ─── CHEMISTRY — Plus One (9 Chapters) ──────────────────────────────────────
  { id: 'mch-chem-p1-1', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 1, chapterName: 'Some Basic Concepts of Chemistry', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 1, estimatedHours: 6 },
  { id: 'mch-chem-p1-2', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 2, chapterName: 'Structure of Atom', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 2, estimatedHours: 8 },
  { id: 'mch-chem-p1-3', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 3, chapterName: 'Classification of Elements and Periodicity in Properties', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 3, estimatedHours: 5 },
  { id: 'mch-chem-p1-4', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 4, chapterName: 'Chemical Bonding and Molecular Structure', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 4, estimatedHours: 9 },
  { id: 'mch-chem-p1-5', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 5, chapterName: 'Chemical Thermodynamics', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 5, estimatedHours: 8 },
  { id: 'mch-chem-p1-6', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 6, chapterName: 'Equilibrium', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 6, estimatedHours: 10 },
  { id: 'mch-chem-p1-7', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 7, chapterName: 'Redox Reactions', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 7, estimatedHours: 5 },
  { id: 'mch-chem-p1-8', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 8, chapterName: 'Organic Chemistry – Some Basic Principles and Techniques', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 8, estimatedHours: 10 },
  { id: 'mch-chem-p1-9', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 9, chapterName: 'Hydrocarbons', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 9, estimatedHours: 9 },

  // ─── MATHEMATICS — Plus One (14 Chapters) ───────────────────────────────────
  { id: 'mch-math-p1-1', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 1, chapterName: 'Sets', sectionName: 'Unit I — Sets and Functions', bookPart: 'Unit I', sortOrder: 1, estimatedHours: 6 },
  { id: 'mch-math-p1-2', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 2, chapterName: 'Relations and Functions', sectionName: 'Unit I — Sets and Functions', bookPart: 'Unit I', sortOrder: 2, estimatedHours: 7 },
  { id: 'mch-math-p1-3', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 3, chapterName: 'Trigonometric Functions', sectionName: 'Unit I — Sets and Functions', bookPart: 'Unit I', sortOrder: 3, estimatedHours: 10 },
  { id: 'mch-math-p1-4', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 4, chapterName: 'Complex Numbers and Quadratic Equations', sectionName: 'Unit II — Algebra', bookPart: 'Unit II', sortOrder: 4, estimatedHours: 6 },
  { id: 'mch-math-p1-5', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 5, chapterName: 'Linear Inequalities', sectionName: 'Unit II — Algebra', bookPart: 'Unit II', sortOrder: 5, estimatedHours: 4 },
  { id: 'mch-math-p1-6', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 6, chapterName: 'Permutations and Combinations', sectionName: 'Unit II — Algebra', bookPart: 'Unit II', sortOrder: 6, estimatedHours: 8 },
  { id: 'mch-math-p1-7', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 7, chapterName: 'Binomial Theorem', sectionName: 'Unit II — Algebra', bookPart: 'Unit II', sortOrder: 7, estimatedHours: 5 },
  { id: 'mch-math-p1-8', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 8, chapterName: 'Sequence and Series', sectionName: 'Unit II — Algebra', bookPart: 'Unit II', sortOrder: 8, estimatedHours: 7 },
  { id: 'mch-math-p1-9', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 9, chapterName: 'Straight Lines', sectionName: 'Unit III — Coordinate Geometry', bookPart: 'Unit III', sortOrder: 9, estimatedHours: 8 },
  { id: 'mch-math-p1-10', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 10, chapterName: 'Conic Sections', sectionName: 'Unit III — Coordinate Geometry', bookPart: 'Unit III', sortOrder: 10, estimatedHours: 8 },
  { id: 'mch-math-p1-11', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 11, chapterName: 'Introduction to Three-Dimensional Geometry', sectionName: 'Unit III — Coordinate Geometry', bookPart: 'Unit III', sortOrder: 11, estimatedHours: 5 },
  { id: 'mch-math-p1-12', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 12, chapterName: 'Limits and Derivatives', sectionName: 'Unit IV — Calculus', bookPart: 'Unit IV', sortOrder: 12, estimatedHours: 10 },
  { id: 'mch-math-p1-13', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 13, chapterName: 'Statistics', sectionName: 'Unit V — Statistics and Probability', bookPart: 'Unit V', sortOrder: 13, estimatedHours: 6 },
  { id: 'mch-math-p1-14', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 14, chapterName: 'Probability', sectionName: 'Unit V — Statistics and Probability', bookPart: 'Unit V', sortOrder: 14, estimatedHours: 6 },

  // ─── BIOLOGY — Plus One (19 Chapters) ───────────────────────────────────────
  { id: 'mch-bio-p1-1', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 1, chapterName: 'The Living World', sectionName: 'Unit I — Diversity in the Living World', bookPart: 'Unit I', sortOrder: 1, estimatedHours: 4 },
  { id: 'mch-bio-p1-2', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 2, chapterName: 'Biological Classification', sectionName: 'Unit I — Diversity in the Living World', bookPart: 'Unit I', sortOrder: 2, estimatedHours: 6 },
  { id: 'mch-bio-p1-3', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 3, chapterName: 'Plant Kingdom', sectionName: 'Unit I — Diversity in the Living World', bookPart: 'Unit I', sortOrder: 3, estimatedHours: 7 },
  { id: 'mch-bio-p1-4', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 4, chapterName: 'Animal Kingdom', sectionName: 'Unit I — Diversity in the Living World', bookPart: 'Unit I', sortOrder: 4, estimatedHours: 8 },
  { id: 'mch-bio-p1-5', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 5, chapterName: 'Morphology of Flowering Plants', sectionName: 'Unit II — Structural Organisation in Plants and Animals', bookPart: 'Unit II', sortOrder: 5, estimatedHours: 7 },
  { id: 'mch-bio-p1-6', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 6, chapterName: 'Anatomy of Flowering Plants', sectionName: 'Unit II — Structural Organisation in Plants and Animals', bookPart: 'Unit II', sortOrder: 6, estimatedHours: 7 },
  { id: 'mch-bio-p1-7', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 7, chapterName: 'Structural Organisation in Animals', sectionName: 'Unit II — Structural Organisation in Plants and Animals', bookPart: 'Unit II', sortOrder: 7, estimatedHours: 6 },
  { id: 'mch-bio-p1-8', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 8, chapterName: 'Cell: The Unit of Life', sectionName: 'Unit III — Cell: Structure and Functions', bookPart: 'Unit III', sortOrder: 8, estimatedHours: 8 },
  { id: 'mch-bio-p1-9', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 9, chapterName: 'Biomolecules', sectionName: 'Unit III — Cell: Structure and Functions', bookPart: 'Unit III', sortOrder: 9, estimatedHours: 7 },
  { id: 'mch-bio-p1-10', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 10, chapterName: 'Cell Cycle and Cell Division', sectionName: 'Unit III — Cell: Structure and Functions', bookPart: 'Unit III', sortOrder: 10, estimatedHours: 6 },
  { id: 'mch-bio-p1-11', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 11, chapterName: 'Photosynthesis in Higher Plants', sectionName: 'Unit IV — Plant Physiology', bookPart: 'Unit IV', sortOrder: 11, estimatedHours: 8 },
  { id: 'mch-bio-p1-12', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 12, chapterName: 'Respiration in Plants', sectionName: 'Unit IV — Plant Physiology', bookPart: 'Unit IV', sortOrder: 12, estimatedHours: 7 },
  { id: 'mch-bio-p1-13', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 13, chapterName: 'Plant Growth and Development', sectionName: 'Unit IV — Plant Physiology', bookPart: 'Unit IV', sortOrder: 13, estimatedHours: 7 },
  { id: 'mch-bio-p1-14', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 14, chapterName: 'Breathing and Exchange of Gases', sectionName: 'Unit V — Human Physiology', bookPart: 'Unit V', sortOrder: 14, estimatedHours: 6 },
  { id: 'mch-bio-p1-15', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 15, chapterName: 'Body Fluids and Circulation', sectionName: 'Unit V — Human Physiology', bookPart: 'Unit V', sortOrder: 15, estimatedHours: 8 },
  { id: 'mch-bio-p1-16', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 16, chapterName: 'Excretory Products and Their Elimination', sectionName: 'Unit V — Human Physiology', bookPart: 'Unit V', sortOrder: 16, estimatedHours: 7 },
  { id: 'mch-bio-p1-17', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 17, chapterName: 'Locomotion and Movement', sectionName: 'Unit V — Human Physiology', bookPart: 'Unit V', sortOrder: 17, estimatedHours: 7 },
  { id: 'mch-bio-p1-18', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 18, chapterName: 'Neural Control and Coordination', sectionName: 'Unit V — Human Physiology', bookPart: 'Unit V', sortOrder: 18, estimatedHours: 9 },
  { id: 'mch-bio-p1-19', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 19, chapterName: 'Chemical Coordination and Integration', sectionName: 'Unit V — Human Physiology', bookPart: 'Unit V', sortOrder: 19, estimatedHours: 8 },

  // ─── ACCOUNTANCY — Plus One (9 Chapters) ────────────────────────────────────
  { id: 'mch-acc-p1-1', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 1, chapterName: 'Introduction to Accounting', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 1, estimatedHours: 6 },
  { id: 'mch-acc-p1-2', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 2, chapterName: 'Theory Base of Accounting', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 2, estimatedHours: 6 },
  { id: 'mch-acc-p1-3', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 3, chapterName: 'Recording of Transactions – I', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 3, estimatedHours: 10 },
  { id: 'mch-acc-p1-4', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 4, chapterName: 'Recording of Transactions – II', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 4, estimatedHours: 8 },
  { id: 'mch-acc-p1-5', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 5, chapterName: 'Bank Reconciliation Statement', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 5, estimatedHours: 7 },
  { id: 'mch-acc-p1-6', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 6, chapterName: 'Depreciation, Provisions and Reserves', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 6, estimatedHours: 8 },
  { id: 'mch-acc-p1-7', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 7, chapterName: 'Trial Balance and Rectification of Errors', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 7, estimatedHours: 8 },
  { id: 'mch-acc-p1-8', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 8, chapterName: 'Financial Statements of Sole Proprietorship', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 8, estimatedHours: 12 },
  { id: 'mch-acc-p1-9', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 9, chapterName: 'Financial Statements from Incomplete Records', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 9, estimatedHours: 9 },

  // ─── BUSINESS STUDIES — Plus One (10 Chapters) ──────────────────────────────
  { id: 'mch-bst-p1-1', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 1, chapterName: 'Nature and Purpose of Business', sectionName: 'Part 1 — Foundations of Business', bookPart: 'Part 1', sortOrder: 1, estimatedHours: 6 },
  { id: 'mch-bst-p1-2', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 2, chapterName: 'Forms of Business Organisation', sectionName: 'Part 1 — Foundations of Business', bookPart: 'Part 1', sortOrder: 2, estimatedHours: 8 },
  { id: 'mch-bst-p1-3', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 3, chapterName: 'Public, Private, and Global Enterprises', sectionName: 'Part 1 — Foundations of Business', bookPart: 'Part 1', sortOrder: 3, estimatedHours: 6 },
  { id: 'mch-bst-p1-4', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 4, chapterName: 'Business Services', sectionName: 'Part 1 — Foundations of Business', bookPart: 'Part 1', sortOrder: 4, estimatedHours: 8 },
  { id: 'mch-bst-p1-5', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 5, chapterName: 'Emerging Modes of Business', sectionName: 'Part 1 — Foundations of Business', bookPart: 'Part 1', sortOrder: 5, estimatedHours: 5 },
  { id: 'mch-bst-p1-6', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 6, chapterName: 'Social Responsibility of Business and Business Ethics', sectionName: 'Part 1 — Foundations of Business', bookPart: 'Part 1', sortOrder: 6, estimatedHours: 6 },
  { id: 'mch-bst-p1-7', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 7, chapterName: 'Sources of Business Finance', sectionName: 'Part 2 — Finance, Trade and Operations', bookPart: 'Part 2', sortOrder: 7, estimatedHours: 8 },
  { id: 'mch-bst-p1-8', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 8, chapterName: 'Small Business and Entrepreneurship', sectionName: 'Part 2 — Finance, Trade and Operations', bookPart: 'Part 2', sortOrder: 8, estimatedHours: 7 },
  { id: 'mch-bst-p1-9', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 9, chapterName: 'Internal Trade', sectionName: 'Part 2 — Finance, Trade and Operations', bookPart: 'Part 2', sortOrder: 9, estimatedHours: 8 },
  { id: 'mch-bst-p1-10', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 10, chapterName: 'International Business', sectionName: 'Part 2 — Finance, Trade and Operations', bookPart: 'Part 2', sortOrder: 10, estimatedHours: 8 },

  // ─── ECONOMICS — Plus One (13 Chapters) ─────────────────────────────────────
  { id: 'mch-eco-p1-1', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 1, chapterName: 'Introduction', sectionName: 'Statistics for Economics', bookPart: 'Statistics for Economics', sortOrder: 1, estimatedHours: 4 },
  { id: 'mch-eco-p1-2', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 2, chapterName: 'Collection of Data', sectionName: 'Statistics for Economics', bookPart: 'Statistics for Economics', sortOrder: 2, estimatedHours: 6 },
  { id: 'mch-eco-p1-3', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 3, chapterName: 'Organisation of Data', sectionName: 'Statistics for Economics', bookPart: 'Statistics for Economics', sortOrder: 3, estimatedHours: 6 },
  { id: 'mch-eco-p1-4', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 4, chapterName: 'Presentation of Data', sectionName: 'Statistics for Economics', bookPart: 'Statistics for Economics', sortOrder: 4, estimatedHours: 7 },
  { id: 'mch-eco-p1-5', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 5, chapterName: 'Measures of Central Tendency', sectionName: 'Statistics for Economics', bookPart: 'Statistics for Economics', sortOrder: 5, estimatedHours: 9 },
  { id: 'mch-eco-p1-6', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 6, chapterName: 'Measures of Dispersion', sectionName: 'Statistics for Economics', bookPart: 'Statistics for Economics', sortOrder: 6, estimatedHours: 8 },
  { id: 'mch-eco-p1-7', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 7, chapterName: 'Correlation and Index Numbers', sectionName: 'Statistics for Economics', bookPart: 'Statistics for Economics', sortOrder: 7, estimatedHours: 8 },
  { id: 'mch-eco-p1-8', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 8, chapterName: 'Introduction to Microeconomics', sectionName: 'Introductory Microeconomics', bookPart: 'Introductory Microeconomics', sortOrder: 8, estimatedHours: 5 },
  { id: 'mch-eco-p1-9', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 9, chapterName: 'Theory of Consumer Behaviour', sectionName: 'Introductory Microeconomics', bookPart: 'Introductory Microeconomics', sortOrder: 9, estimatedHours: 8 },
  { id: 'mch-eco-p1-10', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 10, chapterName: 'Production and Costs', sectionName: 'Introductory Microeconomics', bookPart: 'Introductory Microeconomics', sortOrder: 10, estimatedHours: 8 },
  { id: 'mch-eco-p1-11', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 11, chapterName: 'The Theory of the Firm under Perfect Competition', sectionName: 'Introductory Microeconomics', bookPart: 'Introductory Microeconomics', sortOrder: 11, estimatedHours: 8 },
  { id: 'mch-eco-p1-12', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 12, chapterName: 'Market Equilibrium', sectionName: 'Introductory Microeconomics', bookPart: 'Introductory Microeconomics', sortOrder: 12, estimatedHours: 7 },
  { id: 'mch-eco-p1-13', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus One', chapterNumber: 13, chapterName: 'Non-Competitive Markets', sectionName: 'Introductory Microeconomics', bookPart: 'Introductory Microeconomics', sortOrder: 13, estimatedHours: 6 },


  // ============================================================================
  // ─── PLUS TWO MASTER CHAPTERS (71 Chapters) ─────────────────────────────────
  // ============================================================================

  // ─── PHYSICS — Plus Two (14 Chapters) ───────────────────────────────────────
  { id: 'mch-phy-p2-1', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 1, chapterName: 'Electric Charges and Fields', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 1, estimatedHours: 8 },
  { id: 'mch-phy-p2-2', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 2, chapterName: 'Electrostatic Potential and Capacitance', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 2, estimatedHours: 8 },
  { id: 'mch-phy-p2-3', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 3, chapterName: 'Current Electricity', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 3, estimatedHours: 10 },
  { id: 'mch-phy-p2-4', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 4, chapterName: 'Moving Charges and Magnetism', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 4, estimatedHours: 9 },
  { id: 'mch-phy-p2-5', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 5, chapterName: 'Magnetism and Matter', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 5, estimatedHours: 5 },
  { id: 'mch-phy-p2-6', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 6, chapterName: 'Electromagnetic Induction', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 6, estimatedHours: 7 },
  { id: 'mch-phy-p2-7', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 7, chapterName: 'Alternating Current', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 7, estimatedHours: 8 },
  { id: 'mch-phy-p2-8', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 8, chapterName: 'Electromagnetic Waves', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 8, estimatedHours: 4 },
  { id: 'mch-phy-p2-9', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 9, chapterName: 'Ray Optics and Optical Instruments', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 9, estimatedHours: 11 },
  { id: 'mch-phy-p2-10', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 10, chapterName: 'Wave Optics', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 10, estimatedHours: 8 },
  { id: 'mch-phy-p2-11', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 11, chapterName: 'Dual Nature of Radiation and Matter', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 11, estimatedHours: 6 },
  { id: 'mch-phy-p2-12', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 12, chapterName: 'Atoms', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 12, estimatedHours: 5 },
  { id: 'mch-phy-p2-13', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 13, chapterName: 'Nuclei', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 13, estimatedHours: 5 },
  { id: 'mch-phy-p2-14', subjectId: 'sub-phy', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 14, chapterName: 'Semiconductor Electronics', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 14, estimatedHours: 9 },

  // ─── CHEMISTRY — Plus Two (10 Chapters) ─────────────────────────────────────
  { id: 'mch-chem-p2-1', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 1, chapterName: 'Solutions', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 1, estimatedHours: 7 },
  { id: 'mch-chem-p2-2', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 2, chapterName: 'Electrochemistry', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 2, estimatedHours: 9 },
  { id: 'mch-chem-p2-3', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 3, chapterName: 'Chemical Kinetics', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 3, estimatedHours: 8 },
  { id: 'mch-chem-p2-4', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 4, chapterName: 'The d- and f-Block Elements', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 4, estimatedHours: 7 },
  { id: 'mch-chem-p2-5', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 5, chapterName: 'Coordination Compounds', sectionName: 'Part 1', bookPart: 'Part 1', sortOrder: 5, estimatedHours: 8 },
  { id: 'mch-chem-p2-6', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 6, chapterName: 'Haloalkanes and Haloarenes', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 6, estimatedHours: 7 },
  { id: 'mch-chem-p2-7', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 7, chapterName: 'Alcohols, Phenols, and Ethers', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 7, estimatedHours: 8 },
  { id: 'mch-chem-p2-8', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 8, chapterName: 'Aldehydes, Ketones, and Carboxylic Acids', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 8, estimatedHours: 10 },
  { id: 'mch-chem-p2-9', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 9, chapterName: 'Amines', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 9, estimatedHours: 6 },
  { id: 'mch-chem-p2-10', subjectId: 'sub-chem', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 10, chapterName: 'Biomolecules', sectionName: 'Part 2', bookPart: 'Part 2', sortOrder: 10, estimatedHours: 6 },

  // ─── MATHEMATICS — Plus Two (13 Chapters) ───────────────────────────────────
  { id: 'mch-math-p2-1', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 1, chapterName: 'Relations and Functions', sectionName: 'Unit I — Relations and Functions', bookPart: 'Unit I', sortOrder: 1, estimatedHours: 7 },
  { id: 'mch-math-p2-2', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 2, chapterName: 'Inverse Trigonometric Functions', sectionName: 'Unit I — Relations and Functions', bookPart: 'Unit I', sortOrder: 2, estimatedHours: 6 },
  { id: 'mch-math-p2-3', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 3, chapterName: 'Matrices', sectionName: 'Unit II — Algebra', bookPart: 'Unit II', sortOrder: 3, estimatedHours: 7 },
  { id: 'mch-math-p2-4', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 4, chapterName: 'Determinants', sectionName: 'Unit II — Algebra', bookPart: 'Unit II', sortOrder: 4, estimatedHours: 8 },
  { id: 'mch-math-p2-5', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 5, chapterName: 'Continuity and Differentiability', sectionName: 'Unit III — Calculus', bookPart: 'Unit III', sortOrder: 5, estimatedHours: 12 },
  { id: 'mch-math-p2-6', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 6, chapterName: 'Application of Derivatives', sectionName: 'Unit III — Calculus', bookPart: 'Unit III', sortOrder: 6, estimatedHours: 10 },
  { id: 'mch-math-p2-7', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 7, chapterName: 'Integrals', sectionName: 'Unit III — Calculus', bookPart: 'Unit III', sortOrder: 7, estimatedHours: 16 },
  { id: 'mch-math-p2-8', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 8, chapterName: 'Application of Integrals', sectionName: 'Unit III — Calculus', bookPart: 'Unit III', sortOrder: 8, estimatedHours: 7 },
  { id: 'mch-math-p2-9', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 9, chapterName: 'Differential Equations', sectionName: 'Unit III — Calculus', bookPart: 'Unit III', sortOrder: 9, estimatedHours: 9 },
  { id: 'mch-math-p2-10', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 10, chapterName: 'Vector Algebra', sectionName: 'Unit IV — Vectors and 3D Geometry', bookPart: 'Unit IV', sortOrder: 10, estimatedHours: 8 },
  { id: 'mch-math-p2-11', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 11, chapterName: 'Three-Dimensional Geometry', sectionName: 'Unit IV — Vectors and 3D Geometry', bookPart: 'Unit IV', sortOrder: 11, estimatedHours: 8 },
  { id: 'mch-math-p2-12', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 12, chapterName: 'Linear Programming', sectionName: 'Unit V — Linear Programming', bookPart: 'Unit V', sortOrder: 12, estimatedHours: 5 },
  { id: 'mch-math-p2-13', subjectId: 'sub-math', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 13, chapterName: 'Probability', sectionName: 'Unit VI — Probability', bookPart: 'Unit VI', sortOrder: 13, estimatedHours: 8 },

  // ─── BIOLOGY — Plus Two (13 Chapters) ───────────────────────────────────────
  { id: 'mch-bio-p2-1', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 1, chapterName: 'Sexual Reproduction in Flowering Plants', sectionName: 'Unit I — Reproduction', bookPart: 'Unit I', sortOrder: 1, estimatedHours: 8 },
  { id: 'mch-bio-p2-2', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 2, chapterName: 'Human Reproduction', sectionName: 'Unit I — Reproduction', bookPart: 'Unit I', sortOrder: 2, estimatedHours: 8 },
  { id: 'mch-bio-p2-3', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 3, chapterName: 'Reproductive Health', sectionName: 'Unit I — Reproduction', bookPart: 'Unit I', sortOrder: 3, estimatedHours: 5 },
  { id: 'mch-bio-p2-4', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 4, chapterName: 'Principles of Inheritance and Variation', sectionName: 'Unit II — Genetics and Evolution', bookPart: 'Unit II', sortOrder: 4, estimatedHours: 10 },
  { id: 'mch-bio-p2-5', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 5, chapterName: 'Molecular Basis of Inheritance', sectionName: 'Unit II — Genetics and Evolution', bookPart: 'Unit II', sortOrder: 5, estimatedHours: 11 },
  { id: 'mch-bio-p2-6', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 6, chapterName: 'Evolution', sectionName: 'Unit II — Genetics and Evolution', bookPart: 'Unit II', sortOrder: 6, estimatedHours: 8 },
  { id: 'mch-bio-p2-7', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 7, chapterName: 'Human Health and Diseases', sectionName: 'Unit III — Biology in Human Welfare', bookPart: 'Unit III', sortOrder: 7, estimatedHours: 8 },
  { id: 'mch-bio-p2-8', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 8, chapterName: 'Microbes in Human Welfare', sectionName: 'Unit III — Biology in Human Welfare', bookPart: 'Unit III', sortOrder: 8, estimatedHours: 5 },
  { id: 'mch-bio-p2-9', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 9, chapterName: 'Biotechnology: Principles and Processes', sectionName: 'Unit IV — Biotechnology', bookPart: 'Unit IV', sortOrder: 9, estimatedHours: 8 },
  { id: 'mch-bio-p2-10', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 10, chapterName: 'Biotechnology and its Applications', sectionName: 'Unit IV — Biotechnology', bookPart: 'Unit IV', sortOrder: 10, estimatedHours: 7 },
  { id: 'mch-bio-p2-11', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 11, chapterName: 'Organisms and Populations', sectionName: 'Unit V — Ecology', bookPart: 'Unit V', sortOrder: 11, estimatedHours: 7 },
  { id: 'mch-bio-p2-12', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 12, chapterName: 'Ecosystem', sectionName: 'Unit V — Ecology', bookPart: 'Unit V', sortOrder: 12, estimatedHours: 7 },
  { id: 'mch-bio-p2-13', subjectId: 'sub-bio', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 13, chapterName: 'Biodiversity and Conservation', sectionName: 'Unit V — Ecology', bookPart: 'Unit V', sortOrder: 13, estimatedHours: 6 },

  // ─── ACCOUNTANCY — Plus Two (12 Chapters) ──────────────────────────────────
  { id: 'mch-acc-p2-1', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 1, chapterName: 'Accounting for Not-for-Profit Organisations', sectionName: 'Part 1 — Accounting for NPO & Partnership Firms', bookPart: 'Part 1', sortOrder: 1, estimatedHours: 8 },
  { id: 'mch-acc-p2-2', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 2, chapterName: 'Partnership Fundamentals', sectionName: 'Part 1 — Accounting for NPO & Partnership Firms', bookPart: 'Part 1', sortOrder: 2, estimatedHours: 8 },
  { id: 'mch-acc-p2-3', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 3, chapterName: 'Change in Profit Sharing Ratio', sectionName: 'Part 1 — Accounting for NPO & Partnership Firms', bookPart: 'Part 1', sortOrder: 3, estimatedHours: 7 },
  { id: 'mch-acc-p2-4', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 4, chapterName: 'Admission of a Partner', sectionName: 'Part 1 — Accounting for NPO & Partnership Firms', bookPart: 'Part 1', sortOrder: 4, estimatedHours: 10 },
  { id: 'mch-acc-p2-5', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 5, chapterName: 'Retirement of a Partner', sectionName: 'Part 1 — Accounting for NPO & Partnership Firms', bookPart: 'Part 1', sortOrder: 5, estimatedHours: 9 },
  { id: 'mch-acc-p2-6', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 6, chapterName: 'Death of a Partner', sectionName: 'Part 1 — Accounting for NPO & Partnership Firms', bookPart: 'Part 1', sortOrder: 6, estimatedHours: 7 },
  { id: 'mch-acc-p2-7', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 7, chapterName: 'Dissolution of Partnership Firm', sectionName: 'Part 1 — Accounting for NPO & Partnership Firms', bookPart: 'Part 1', sortOrder: 7, estimatedHours: 8 },
  { id: 'mch-acc-p2-8', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 8, chapterName: 'Accounting for Share Capital', sectionName: 'Part 2 — Company Accounts', bookPart: 'Part 2', sortOrder: 8, estimatedHours: 11 },
  { id: 'mch-acc-p2-9', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 9, chapterName: 'Accounting for Debentures', sectionName: 'Part 2 — Company Accounts', bookPart: 'Part 2', sortOrder: 9, estimatedHours: 9 },
  { id: 'mch-acc-p2-10', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 10, chapterName: 'Financial Statements of a Company', sectionName: 'Analysis of Financial Statements', bookPart: 'Analysis', sortOrder: 10, estimatedHours: 8 },
  { id: 'mch-acc-p2-11', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 11, chapterName: 'Accounting Ratios', sectionName: 'Analysis of Financial Statements', bookPart: 'Analysis', sortOrder: 11, estimatedHours: 10 },
  { id: 'mch-acc-p2-12', subjectId: 'sub-acc', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 12, chapterName: 'Cash Flow Statement', sectionName: 'Analysis of Financial Statements', bookPart: 'Analysis', sortOrder: 12, estimatedHours: 11 },

  // ─── BUSINESS STUDIES — Plus Two (12 Chapters) ──────────────────────────────
  { id: 'mch-bst-p2-1', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 1, chapterName: 'Nature and Significance of Management', sectionName: 'Part 1 — Principles and Functions of Management', bookPart: 'Part 1', sortOrder: 1, estimatedHours: 6 },
  { id: 'mch-bst-p2-2', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 2, chapterName: 'Principles of Management', sectionName: 'Part 1 — Principles and Functions of Management', bookPart: 'Part 1', sortOrder: 2, estimatedHours: 7 },
  { id: 'mch-bst-p2-3', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 3, chapterName: 'Business Environment', sectionName: 'Part 1 — Principles and Functions of Management', bookPart: 'Part 1', sortOrder: 3, estimatedHours: 5 },
  { id: 'mch-bst-p2-4', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 4, chapterName: 'Planning', sectionName: 'Part 1 — Principles and Functions of Management', bookPart: 'Part 1', sortOrder: 4, estimatedHours: 6 },
  { id: 'mch-bst-p2-5', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 5, chapterName: 'Organising', sectionName: 'Part 1 — Principles and Functions of Management', bookPart: 'Part 1', sortOrder: 5, estimatedHours: 7 },
  { id: 'mch-bst-p2-6', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 6, chapterName: 'Staffing', sectionName: 'Part 1 — Principles and Functions of Management', bookPart: 'Part 1', sortOrder: 6, estimatedHours: 8 },
  { id: 'mch-bst-p2-7', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 7, chapterName: 'Directing', sectionName: 'Part 1 — Principles and Functions of Management', bookPart: 'Part 1', sortOrder: 7, estimatedHours: 8 },
  { id: 'mch-bst-p2-8', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 8, chapterName: 'Controlling', sectionName: 'Part 1 — Principles and Functions of Management', bookPart: 'Part 1', sortOrder: 8, estimatedHours: 5 },
  { id: 'mch-bst-p2-9', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 9, chapterName: 'Financial Management', sectionName: 'Part 2 — Business Finance and Marketing', bookPart: 'Part 2', sortOrder: 9, estimatedHours: 8 },
  { id: 'mch-bst-p2-10', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 10, chapterName: 'Financial Markets', sectionName: 'Part 2 — Business Finance and Marketing', bookPart: 'Part 2', sortOrder: 10, estimatedHours: 8 },
  { id: 'mch-bst-p2-11', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 11, chapterName: 'Marketing Management', sectionName: 'Part 2 — Business Finance and Marketing', bookPart: 'Part 2', sortOrder: 11, estimatedHours: 10 },
  { id: 'mch-bst-p2-12', subjectId: 'sub-bst', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 12, chapterName: 'Consumer Protection', sectionName: 'Part 2 — Business Finance and Marketing', bookPart: 'Part 2', sortOrder: 12, estimatedHours: 6 },

  // ─── ECONOMICS — Plus Two (9 Chapters) ──────────────────────────────────────
  { id: 'mch-eco-p2-1', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 1, chapterName: 'National Income Accounting', sectionName: 'Introductory Macroeconomics', bookPart: 'Introductory Macroeconomics', sortOrder: 1, estimatedHours: 8 },
  { id: 'mch-eco-p2-2', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 2, chapterName: 'Money and Banking', sectionName: 'Introductory Macroeconomics', bookPart: 'Introductory Macroeconomics', sortOrder: 2, estimatedHours: 6 },
  { id: 'mch-eco-p2-3', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 3, chapterName: 'Determination of Income and Employment', sectionName: 'Introductory Macroeconomics', bookPart: 'Introductory Macroeconomics', sortOrder: 3, estimatedHours: 9 },
  { id: 'mch-eco-p2-4', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 4, chapterName: 'Government Budget and the Economy', sectionName: 'Introductory Macroeconomics', bookPart: 'Introductory Macroeconomics', sortOrder: 4, estimatedHours: 6 },
  { id: 'mch-eco-p2-5', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 5, chapterName: 'Balance of Payments', sectionName: 'Introductory Macroeconomics', bookPart: 'Introductory Macroeconomics', sortOrder: 5, estimatedHours: 6 },
  { id: 'mch-eco-p2-6', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 6, chapterName: 'Development Experience (1947–1990) & Economic Reforms', sectionName: 'Indian Economic Development', bookPart: 'Indian Economic Development', sortOrder: 6, estimatedHours: 8 },
  { id: 'mch-eco-p2-7', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 7, chapterName: 'Economic Reforms since 1991 (LPG Policies)', sectionName: 'Indian Economic Development', bookPart: 'Indian Economic Development', sortOrder: 7, estimatedHours: 7 },
  { id: 'mch-eco-p2-8', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 8, chapterName: 'Current Challenges Facing the Indian Economy (Poverty, Human Capital, Rural Dev, Employment)', sectionName: 'Indian Economic Development', bookPart: 'Indian Economic Development', sortOrder: 8, estimatedHours: 10 },
  { id: 'mch-eco-p2-9', subjectId: 'sub-eco', boardId: 'board-plus-one', classLevel: 'Plus Two', chapterNumber: 9, chapterName: 'Comparative Development Experiences of India and Its Neighbours', sectionName: 'Indian Economic Development', bookPart: 'Indian Economic Development', sortOrder: 9, estimatedHours: 6 },
]


// ─── CURRICULUM SERVICE CLASS ──────────────────────────────────────────────────

class CurriculumService {

  // ─── Master Data Retrieval ─────────────────────────────────────────────────

  async getBoards(): Promise<Board[]> {
    return DEFAULT_BOARDS
  }

  async getStreams(boardId?: string, classLevel?: string): Promise<AcademicStream[]> {
    const streams = DEFAULT_STREAMS
    return streams.filter(s => {
      if (boardId && s.boardId !== boardId) return false
      if (classLevel && s.classLevel !== classLevel) return false
      return true
    })
  }

  async getCombinations(streamId?: string): Promise<SubjectCombination[]> {
    const combinations = DEFAULT_COMBINATIONS
    if (streamId) {
      return combinations.filter(c => c.streamId === streamId)
    }
    return combinations
  }

  async getMasterSubjects(): Promise<MasterSubject[]> {
    return DEFAULT_MASTER_SUBJECTS
  }

  async getCombinationSubjects(combinationId: string): Promise<MasterSubject[]> {
    const allMaster = await this.getMasterSubjects()
    const mappings = DEFAULT_COMBINATION_SUBJECTS.filter(m => m.combinationId === combinationId)
    const subjectIds = new Set(mappings.map(m => m.subjectId))
    return allMaster.filter(s => subjectIds.has(s.id))
  }

  async getMasterChapters(subjectId: string, boardId?: string, classLevel?: string): Promise<MasterChapter[]> {
    const chapters = DEFAULT_MASTER_CHAPTERS

    // Resolve subject identifier
    const cleanSubId = subjectId.replace(/^sub-user-/, '').split('-')[0]
    const targetSubId = cleanSubId.startsWith('sub-') ? cleanSubId : `sub-${cleanSubId}`

    const isClass11 = classLevel === 'Plus One' || classLevel === 'Class 11'
    const isClass12 = classLevel === 'Plus Two' || classLevel === 'Class 12'

    let filtered = chapters.filter(c => {
      const subMatch = c.subjectId === subjectId || c.subjectId === targetSubId
      if (!subMatch) return false

      if (classLevel) {
        if (c.classLevel === classLevel) return true
        if (isClass11 && (c.classLevel === 'Plus One' || c.classLevel === 'Class 11')) return true
        if (isClass12 && (c.classLevel === 'Plus Two' || c.classLevel === 'Class 12')) return true
        return false
      }
      return true
    })

    if (filtered.length === 0) {
      filtered = chapters.filter(c => c.subjectId === subjectId || c.subjectId === targetSubId)
    }

    return filtered.sort((a, b) => (a.sortOrder || a.chapterNumber || 0) - (b.sortOrder || b.chapterNumber || 0))
  }

  // ─── AUTOMATIC SUBJECT & CHAPTER SETUP ENGINE ─────────────────────────────

  /**
   * Applies selected academic options to user profile and configures subjects/chapters.
   * DATA SAFETY: Unselected subjects or subjects from previous class levels are marked
   * as inactive (enabled: false) so historical user progress (sessions, notes, revisions, tests)
   * is NEVER deleted.
   */
  async applyAcademicSetup(params: {
    userId: string
    fullName?: string
    boardId: string
    classLevel: string
    streamId: string
    combinationId: string
    academicGoal?: string
  }): Promise<{ addedCount: number; updatedCount: number }> {
    const { userId, fullName, boardId, classLevel, streamId, combinationId, academicGoal } = params

    // 1. Fetch subjects assigned to the chosen combination
    const combinationMasterSubjects = await this.getCombinationSubjects(combinationId)
    const activeSubjectIds = new Set(combinationMasterSubjects.map(s => s.id))

    // 2. Fetch existing user subjects & study subjects
    const existingStudySubjects = studyERPStorage.getSubjects()

    let addedCount = 0
    let updatedCount = 0

    // 3. Process existing user subjects: set enabled flag according to target class level
    for (const sub of existingStudySubjects) {
      const isClassMatch = !sub.classLevel || sub.classLevel === classLevel
      const isTarget = isClassMatch && activeSubjectIds.has(sub.subjectId || sub.id)
      if (sub.enabled !== isTarget) {
        studyERPStorage.updateSubject(sub.id, { enabled: isTarget })
        updatedCount++
      }
    }

    // 4. Instantiate new subjects & chapters from master curriculum for target class level
    for (const masterSub of combinationMasterSubjects) {
      const existingSub = existingStudySubjects.find(s =>
        (s.subjectId === masterSub.id || s.id === masterSub.id || s.code === masterSub.code) &&
        (s.classLevel === classLevel || (!s.classLevel && (classLevel === 'Plus One' || classLevel === 'Class 11')))
      )

      if (!existingSub) {
        // Create new study subject for this specific class level
        const cleanClassTag = classLevel.replace(/\s+/g, '').toLowerCase()
        const newSubject: Subject = {
          id: `sub-user-${masterSub.id}-${cleanClassTag}-${Date.now()}`,
          subjectId: masterSub.id,
          name: `${masterSub.name} (${classLevel})`,
          code: masterSub.code,
          boardId,
          classLevel,
          studyHours: 0,
          targetHours: 40,
          completedChapters: 0,
          pendingChapters: 0,
          completionPercentage: 0,
          enabled: true,
          icon: masterSub.icon,
          color: masterSub.color,
        }

        studyERPStorage.addSubject(newSubject)
        addedCount++

        // Save binding in user_subjects table directly to Supabase Cloud
        if (isSupabaseConfigured()) {
          try {
            const { data: { session } } = await supabase.auth.getSession()
            const authUserId = session?.user?.id
            if (authUserId) {
              await (supabase as any).from('user_subjects').upsert({
                id: generateId(),
                user_id: authUserId,
                subject_id: masterSub.id,
                class_level: classLevel,
                enabled: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }, { onConflict: 'id' })
            }
          } catch (e) {
            console.warn('[CurriculumService] user_subjects cloud save error:', e)
          }
        }

        // Fetch master chapters for this subject and target class level
        const masterChapters = await this.getMasterChapters(masterSub.id, boardId, classLevel)

        // Add chapters to studyERP storage with sectionName / bookPart metadata
        for (const mCh of masterChapters) {
          const chRecord: Chapter = {
            id: `ch-${newSubject.id}-${mCh.chapterNumber}-${generateId().slice(0, 6)}`,
            subjectId: newSubject.id,
            name: `${mCh.chapterNumber}. ${mCh.chapterName}`,
            chapterNumber: mCh.chapterNumber,
            sectionName: mCh.sectionName,
            bookPart: mCh.bookPart,
            sortOrder: mCh.sortOrder || mCh.chapterNumber,
            priority: 'medium',
            difficulty: 'medium',
            status: 'not_started',
            estimatedHours: mCh.estimatedHours || 6,
            completedHours: 0,
            notes: '',
            revisionCount: 0,
            confidencePercentage: 0,
          }
          studyERPStorage.addChapter(chRecord)
        }
      } else {
        // Ensure existing subject for this class level is enabled and linked
        studyERPStorage.updateSubject(existingSub.id, {
          enabled: true,
          boardId,
          classLevel,
          subjectId: masterSub.id,
          code: masterSub.code
        })

        // Auto-heal: If existing subject has 0 chapters, populate them now
        const existingChs = studyERPStorage.getChapters(existingSub.id)
        if (existingChs.length === 0) {
          const masterChapters = await this.getMasterChapters(masterSub.id, boardId, classLevel)
          for (const mCh of masterChapters) {
            const chRecord: Chapter = {
              id: `ch-${existingSub.id}-${mCh.chapterNumber}-${generateId().slice(0, 6)}`,
              subjectId: existingSub.id,
              name: `${mCh.chapterNumber}. ${mCh.chapterName}`,
              chapterNumber: mCh.chapterNumber,
              sectionName: mCh.sectionName,
              bookPart: mCh.bookPart,
              sortOrder: mCh.sortOrder || mCh.chapterNumber,
              priority: 'medium',
              difficulty: 'medium',
              status: 'not_started',
              estimatedHours: mCh.estimatedHours || 6,
              completedHours: 0,
              notes: '',
              revisionCount: 0,
              confidencePercentage: 0,
            }
            studyERPStorage.addChapter(chRecord)
          }
        }
      }
    }

    // 5. Update user profile in IndexedDB and memoryStore
    const currentProfile = (memoryStore.profile || {}) as any
    const updatedProfile = {
      ...currentProfile,
      ...(fullName ? { full_name: fullName } : {}),
      board_id: boardId,
      class_level: classLevel,
      stream_id: streamId,
      subject_combination_id: combinationId,
      academic_goal: academicGoal || currentProfile.academic_goal,
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    }

    memoryStore.profile = updatedProfile as any
    // Persist profile update to Supabase Cloud directly
    if (isSupabaseConfigured()) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const authUserId = session?.user?.id
        if (authUserId) {
          await (supabase.from('profile') as any).upsert(
            { ...updatedProfile, id: updatedProfile.id || 'user_profile', user_id: authUserId },
            { onConflict: 'id' }
          )
        }
      } catch (e) {
        console.warn('[CurriculumService] profile cloud save error:', e)
      }
    }

    try {
      localStorage.setItem('onboarding_completed_global', 'true')
      if (userId) localStorage.setItem(`onboarding_completed_${userId}`, 'true')
    } catch (e) {}

    // Also update Supabase profile if connected
    try {
      const { supabase, isSupabaseConfigured } = await import('@/services/supabase/supabase')
      if (isSupabaseConfigured() && userId && userId !== 'guest') {
        const client = supabase as any
        const { error } = await client.from('profiles').update({
          ...(fullName ? { full_name: fullName } : {}),
          board_id: boardId,
          class_level: classLevel,
          stream_id: streamId,
          subject_combination_id: combinationId,
          academic_goal: academicGoal,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        }).eq('id', userId)
        if (error) console.error('[CurriculumService] Supabase profile sync error:', error)
      }
    } catch (err) {
      console.error('[CurriculumService] Supabase profile sync exception:', err)
    }

    return { addedCount, updatedCount }
  }
}

export const curriculumService = new CurriculumService()
